# 📝 EXAMPLE EXAM SOLUTION - Car Rental System

This is a complete example solution for a typical RESTful exam question. Use this as a reference template.

---

## 📄 EXAM QUESTION (Example)

**"Build a Car Rental System with the following requirements:**

**Entities:**
1. **Car** - brand, model, year, pricePerDay, status (AVAILABLE, RENTED, MAINTENANCE)
2. **Booking** - car, user, startDate, endDate, totalPrice, status (PENDING, CONFIRMED, CANCELLED, COMPLETED)

**Requirements:**
1. Users can view all available cars
2. Users can book an available car
3. Users can view their own bookings
4. Admins can manage all cars (CRUD)
5. Admins can view all bookings
6. System calculates total price based on days and car price
7. Cars marked as RENTED when booking confirmed
8. JWT authentication required for all operations except viewing cars"

---

## 🔧 SOLUTION - Step by Step

### STEP 1: Update Prisma Schema

**File:** `server/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(USER)
  isVerified Boolean @default(false)
  otp       String?
  otpExpiry DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  bookings  Booking[]

  @@map("users")
}

model Car {
  id          String    @id @default(uuid())
  brand       String
  model       String
  year        Int
  pricePerDay Decimal   @db.Decimal(10, 2)
  status      CarStatus @default(AVAILABLE)
  imageUrl    String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  bookings    Booking[]

  @@map("cars")
}

model Booking {
  id          String        @id @default(uuid())
  carId       String
  car         Car           @relation(fields: [carId], references: [id], onDelete: Cascade)
  userId      String
  user        User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  startDate   DateTime
  endDate     DateTime
  totalPrice  Decimal       @db.Decimal(10, 2)
  status      BookingStatus @default(PENDING)
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@map("bookings")
}

enum Role {
  USER
  ADMIN
}

enum CarStatus {
  AVAILABLE
  RENTED
  MAINTENANCE
}

enum BookingStatus {
  PENDING
  CONFIRMED
  CANCELLED
  COMPLETED
}
```

**Run migrations:**
```bash
npx prisma db push
npx prisma generate
```

---

### STEP 2: Cars Module (Backend)

#### 2.1 Car Service (`server/src/modules/cars/car.service.js`)

```javascript
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import { getPagination, buildPaginatedResponse } from '../../utils/pagination.js';

export async function getAll(query) {
  const { page, limit, skip } = getPagination(query);
  const where = {};

  // Filter by status
  if (query.status) {
    where.status = query.status;
  }

  // Filter by price range
  if (query.minPrice || query.maxPrice) {
    where.pricePerDay = {};
    if (query.minPrice) where.pricePerDay.gte = parseFloat(query.minPrice);
    if (query.maxPrice) where.pricePerDay.lte = parseFloat(query.maxPrice);
  }

  // Filter by year
  if (query.year) {
    where.year = parseInt(query.year);
  }

  // Search by brand or model
  if (query.search) {
    where.OR = [
      { brand: { contains: query.search, mode: 'insensitive' } },
      { model: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  const [cars, total] = await Promise.all([
    prisma.car.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.car.count({ where }),
  ]);

  return buildPaginatedResponse(cars, total, { page, limit });
}

export async function getById(id) {
  const car = await prisma.car.findUnique({
    where: { id },
    include: {
      bookings: {
        where: { status: { in: ['PENDING', 'CONFIRMED'] } },
        orderBy: { startDate: 'asc' },
      },
    },
  });

  if (!car) {
    throw new AppError('Car not found', 404);
  }

  return car;
}

export async function create(data) {
  // Validation
  if (data.year < 1900 || data.year > new Date().getFullYear() + 1) {
    throw new AppError('Invalid year', 400);
  }

  if (data.pricePerDay <= 0) {
    throw new AppError('Price per day must be greater than 0', 400);
  }

  return prisma.car.create({ data });
}

export async function update(id, data) {
  await getById(id);

  // Don't allow changing status if car has active bookings
  if (data.status && data.status !== 'AVAILABLE') {
    const activeBookings = await prisma.booking.count({
      where: {
        carId: id,
        status: { in: ['PENDING', 'CONFIRMED'] },
      },
    });

    if (activeBookings > 0) {
      throw new AppError('Cannot change status. Car has active bookings', 400);
    }
  }

  return prisma.car.update({
    where: { id },
    data,
  });
}

export async function remove(id) {
  await getById(id);

  // Check if car has any bookings
  const bookingCount = await prisma.booking.count({
    where: { carId: id },
  });

  if (bookingCount > 0) {
    throw new AppError('Cannot delete car with existing bookings', 400);
  }

  await prisma.car.delete({ where: { id } });
  return { message: 'Car deleted successfully' };
}

export async function getAvailableCars(startDate, endDate) {
  // Get cars that don't have confirmed bookings in the date range
  const cars = await prisma.car.findMany({
    where: {
      status: 'AVAILABLE',
      bookings: {
        none: {
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            {
              AND: [
                { startDate: { lte: new Date(startDate) } },
                { endDate: { gte: new Date(startDate) } },
              ],
            },
            {
              AND: [
                { startDate: { lte: new Date(endDate) } },
                { endDate: { gte: new Date(endDate) } },
              ],
            },
            {
              AND: [
                { startDate: { gte: new Date(startDate) } },
                { endDate: { lte: new Date(endDate) } },
              ],
            },
          ],
        },
      },
    },
  });

  return cars;
}
```

#### 2.2 Car Controller (`server/src/modules/cars/car.controller.js`)

```javascript
import * as carService from './car.service.js';

export async function getAll(req, res, next) {
  try {
    const result = await carService.getAll(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const car = await carService.getById(req.params.id);
    res.json({ success: true, data: car });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const car = await carService.create(req.body);
    res.status(201).json({ success: true, data: car });
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const car = await carService.update(req.params.id, req.body);
    res.json({ success: true, data: car });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await carService.remove(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getAvailable(req, res, next) {
  try {
    const { startDate, endDate } = req.query;
    const cars = await carService.getAvailableCars(startDate, endDate);
    res.json({ success: true, data: cars });
  } catch (error) {
    next(error);
  }
}
```

#### 2.3 Car Validation (`server/src/modules/cars/car.validation.js`)

```javascript
import { body, param, query } from 'express-validator';

export const createCarValidation = [
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('model').trim().notEmpty().withMessage('Model is required'),
  body('year').isInt({ min: 1900 }).withMessage('Valid year is required'),
  body('pricePerDay')
    .isDecimal()
    .withMessage('Price per day must be a decimal')
    .custom((value) => parseFloat(value) > 0)
    .withMessage('Price must be greater than 0'),
  body('status').optional().isIn(['AVAILABLE', 'RENTED', 'MAINTENANCE']),
  body('imageUrl').optional().isURL().withMessage('Valid image URL required'),
];

export const updateCarValidation = [
  param('id').isUUID().withMessage('Valid car ID is required'),
  body('brand').optional().trim().notEmpty(),
  body('model').optional().trim().notEmpty(),
  body('year').optional().isInt({ min: 1900 }),
  body('pricePerDay')
    .optional()
    .isDecimal()
    .custom((value) => parseFloat(value) > 0),
  body('status').optional().isIn(['AVAILABLE', 'RENTED', 'MAINTENANCE']),
  body('imageUrl').optional().isURL(),
];

export const carIdValidation = [
  param('id').isUUID().withMessage('Valid car ID is required'),
];

export const availableCarsValidation = [
  query('startDate').isISO8601().withMessage('Valid start date required'),
  query('endDate').isISO8601().withMessage('Valid end date required'),
];
```

#### 2.4 Car Routes (`server/src/modules/cars/car.routes.js`)

```javascript
import { Router } from 'express';
import * as carController from './car.controller.js';
import {
  createCarValidation,
  updateCarValidation,
  carIdValidation,
  availableCarsValidation,
} from './car.validation.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', carController.getAll);
router.get('/available', availableCarsValidation, validate, carController.getAvailable);
router.get('/:id', carIdValidation, validate, carController.getById);

// Admin-only routes
router.post(
  '/',
  authenticate,
  authorize('ADMIN'),
  createCarValidation,
  validate,
  carController.create
);

router.put(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  updateCarValidation,
  validate,
  carController.update
);

router.delete(
  '/:id',
  authenticate,
  authorize('ADMIN'),
  carIdValidation,
  validate,
  carController.remove
);

export default router;
```

---

### STEP 3: Bookings Module (Backend)

#### 3.1 Booking Service (`server/src/modules/bookings/booking.service.js`)

```javascript
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import { getPagination, buildPaginatedResponse } from '../../utils/pagination.js';

function calculateTotalPrice(startDate, endDate, pricePerDay) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  return days * parseFloat(pricePerDay);
}

export async function getAll(query, userId, userRole) {
  const { page, limit, skip } = getPagination(query);
  const where = userRole === 'ADMIN' ? {} : { userId };

  // Filter by status
  if (query.status) {
    where.status = query.status;
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      skip,
      take: limit,
      include: {
        car: true,
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.count({ where }),
  ]);

  return buildPaginatedResponse(bookings, total, { page, limit });
}

export async function getById(id, userId, userRole) {
  const where = { id };
  if (userRole !== 'ADMIN') {
    where.userId = userId;
  }

  const booking = await prisma.booking.findFirst({
    where,
    include: {
      car: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!booking) {
    throw new AppError('Booking not found', 404);
  }

  return booking;
}

export async function create(data, userId) {
  const { carId, startDate, endDate } = data;

  // Validate dates
  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (start < now) {
    throw new AppError('Start date cannot be in the past', 400);
  }

  if (end <= start) {
    throw new AppError('End date must be after start date', 400);
  }

  // Check if car exists and is available
  const car = await prisma.car.findUnique({ where: { id: carId } });
  if (!car) {
    throw new AppError('Car not found', 404);
  }

  if (car.status !== 'AVAILABLE') {
    throw new AppError('Car is not available', 400);
  }

  // Check for conflicting bookings
  const conflictingBooking = await prisma.booking.findFirst({
    where: {
      carId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      OR: [
        {
          AND: [
            { startDate: { lte: start } },
            { endDate: { gte: start } },
          ],
        },
        {
          AND: [
            { startDate: { lte: end } },
            { endDate: { gte: end } },
          ],
        },
        {
          AND: [
            { startDate: { gte: start } },
            { endDate: { lte: end } },
          ],
        },
      ],
    },
  });

  if (conflictingBooking) {
    throw new AppError('Car is already booked for these dates', 400);
  }

  // Calculate total price
  const totalPrice = calculateTotalPrice(startDate, endDate, car.pricePerDay);

  // Create booking
  return prisma.booking.create({
    data: {
      carId,
      userId,
      startDate,
      endDate,
      totalPrice,
    },
    include: { car: true },
  });
}

export async function updateStatus(id, newStatus, userId, userRole) {
  const booking = await getById(id, userId, userRole);

  // Validate status transitions
  const validTransitions = {
    PENDING: ['CONFIRMED', 'CANCELLED'],
    CONFIRMED: ['COMPLETED', 'CANCELLED'],
    COMPLETED: [],
    CANCELLED: [],
  };

  if (!validTransitions[booking.status].includes(newStatus)) {
    throw new AppError(
      `Cannot transition from ${booking.status} to ${newStatus}`,
      400
    );
  }

  // Update car status based on booking status
  let carStatus = booking.car.status;
  if (newStatus === 'CONFIRMED') {
    carStatus = 'RENTED';
  } else if (newStatus === 'COMPLETED' || newStatus === 'CANCELLED') {
    // Check if car has other active bookings
    const activeBookings = await prisma.booking.count({
      where: {
        carId: booking.carId,
        id: { not: id },
        status: { in: ['CONFIRMED', 'PENDING'] },
      },
    });
    if (activeBookings === 0) {
      carStatus = 'AVAILABLE';
    }
  }

  // Update booking and car in transaction
  const [updatedBooking] = await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: { status: newStatus },
      include: { car: true, user: { select: { id: true, name: true, email: true } } },
    }),
    prisma.car.update({
      where: { id: booking.carId },
      data: { status: carStatus },
    }),
  ]);

  return updatedBooking;
}

export async function remove(id, userId, userRole) {
  const booking = await getById(id, userId, userRole);

  if (booking.status === 'CONFIRMED') {
    throw new AppError('Cannot delete confirmed booking', 400);
  }

  await prisma.booking.delete({ where: { id } });
  return { message: 'Booking deleted successfully' };
}
```

#### 3.2 Booking Controller (`server/src/modules/bookings/booking.controller.js`)

```javascript
import * as bookingService from './booking.service.js';

export async function getAll(req, res, next) {
  try {
    const result = await bookingService.getAll(req.query, req.user.id, req.user.role);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

export async function getById(req, res, next) {
  try {
    const booking = await bookingService.getById(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

export async function create(req, res, next) {
  try {
    const booking = await bookingService.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

export async function updateStatus(req, res, next) {
  try {
    const booking = await bookingService.updateStatus(
      req.params.id,
      req.body.status,
      req.user.id,
      req.user.role
    );
    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await bookingService.remove(req.params.id, req.user.id, req.user.role);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}
```

#### 3.3 Booking Validation & Routes

```javascript
// booking.validation.js
import { body, param } from 'express-validator';

export const createBookingValidation = [
  body('carId').isUUID().withMessage('Valid car ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
];

export const updateStatusValidation = [
  param('id').isUUID().withMessage('Valid booking ID is required'),
  body('status')
    .isIn(['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'])
    .withMessage('Valid status is required'),
];

export const bookingIdValidation = [
  param('id').isUUID().withMessage('Valid booking ID is required'),
];
```

```javascript
// booking.routes.js
import { Router } from 'express';
import * as bookingController from './booking.controller.js';
import {
  createBookingValidation,
  updateStatusValidation,
  bookingIdValidation,
} from './booking.validation.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate } from '../../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/', bookingController.getAll);
router.get('/:id', bookingIdValidation, validate, bookingController.getById);
router.post('/', createBookingValidation, validate, bookingController.create);
router.patch('/:id/status', updateStatusValidation, validate, bookingController.updateStatus);
router.delete('/:id', bookingIdValidation, validate, bookingController.remove);

export default router;
```

---

### STEP 4: Register Routes

**File:** `server/src/app.js`

```javascript
import carRoutes from './modules/cars/car.routes.js';
import bookingRoutes from './modules/bookings/booking.routes.js';

// Add these after existing routes
app.use('/api/cars', carRoutes);
app.use('/api/bookings', bookingRoutes);
```

---

This example shows a complete, production-quality solution. Study it carefully! 🚀
