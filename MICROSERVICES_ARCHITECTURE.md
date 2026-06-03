# 🏗️ MICROSERVICES-INSPIRED ARCHITECTURE

## Overview

This starter follows a **modular, microservice-inspired structure** where each domain (auth, items, cars, bookings, etc.) is self-contained and follows the same architectural pattern.

---

## 🎯 Core Principles

### 1. **Separation of Concerns**
Each module handles one business domain with clear boundaries:
- `auth/` - User authentication and authorization
- `modules/items/` - Sample CRUD domain (rename for your exam)
- `modules/cars/` - Example additional domain
- `modules/bookings/` - Example additional domain

### 2. **Layered Architecture**
Every module follows the same 4-layer pattern:

```
┌─────────────────────────────────────┐
│         ROUTES (HTTP Layer)         │  ← Define endpoints, attach middleware
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│       VALIDATION (Data Layer)       │  ← Validate incoming requests
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│      CONTROLLER (Request Handler)   │  ← Handle HTTP req/res, call services
└─────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────┐
│    SERVICE (Business Logic Layer)   │  ← Business rules, database operations
└─────────────────────────────────────┘
```

### 3. **Independent Modules**
Each module is **self-contained** and can be:
- Developed independently
- Tested independently
- Deployed as separate microservice (if needed)
- Reused in different projects

---

## 📂 PROJECT STRUCTURE

```
server/
├── src/
│   ├── auth/                          # Authentication Domain
│   │   ├── auth.controller.js        #   Request handlers
│   │   ├── auth.service.js           #   Business logic
│   │   ├── auth.routes.js            #   Route definitions
│   │   └── auth.validation.js        #   Input validation
│   │
│   ├── modules/                       # Business Domains (Microservices)
│   │   ├── items/                    #   Item Domain (Sample)
│   │   │   ├── item.controller.js
│   │   │   ├── item.service.js
│   │   │   ├── item.routes.js
│   │   │   └── item.validation.js
│   │   │
│   │   ├── cars/                     #   Car Domain (Example)
│   │   │   ├── car.controller.js
│   │   │   ├── car.service.js
│   │   │   ├── car.routes.js
│   │   │   └── car.validation.js
│   │   │
│   │   └── bookings/                 #   Booking Domain (Example)
│   │       ├── booking.controller.js
│   │       ├── booking.service.js
│   │       ├── booking.routes.js
│   │       └── booking.validation.js
│   │
│   ├── middleware/                    # Shared Middleware
│   │   ├── auth.middleware.js        #   JWT authentication
│   │   ├── error.middleware.js       #   Global error handling
│   │   └── validate.middleware.js    #   Validation error handler
│   │
│   ├── config/                        # Configuration
│   │   ├── database.js               #   Prisma client
│   │   └── env.js                    #   Environment variables
│   │
│   ├── utils/                         # Shared Utilities
│   │   ├── AppError.js               #   Custom error class
│   │   ├── token.js                  #   JWT utilities
│   │   ├── otp.js                    #   OTP utilities
│   │   ├── email.js                  #   Email service
│   │   └── pagination.js             #   Pagination helpers
│   │
│   ├── docs/                          # API Documentation
│   │   └── swagger.js                #   Swagger configuration
│   │
│   ├── app.js                         # Express app setup
│   └── index.js                       # Server entry point
│
├── prisma/
│   └── schema.prisma                  # Database schema
│
└── package.json
```

---

## 🔄 MODULE ARCHITECTURE (Microservice Pattern)

Each module is **fully independent** and follows this structure:

### **1. Routes Layer** (`*.routes.js`)
**Responsibility:** Define HTTP endpoints and attach middleware

```javascript
import { Router } from 'express';
import * as controller from './item.controller.js';
import { validation } from './item.validation.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

const router = Router();

// Public endpoints
router.post('/', validation.create, validate, controller.create);

// Protected endpoints
router.get('/', authenticate, controller.getAll);
router.get('/:id', authenticate, controller.getById);

// Admin-only endpoints
router.delete('/:id', authenticate, authorize('ADMIN'), controller.remove);

export default router;
```

### **2. Validation Layer** (`*.validation.js`)
**Responsibility:** Validate and sanitize incoming data

```javascript
import { body, param } from 'express-validator';

export const createItemValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('price').isDecimal().withMessage('Price must be a decimal'),
  body('status').optional().isIn(['ACTIVE', 'INACTIVE']),
];

export const itemIdValidation = [
  param('id').isUUID().withMessage('Valid item ID is required'),
];
```

### **3. Controller Layer** (`*.controller.js`)
**Responsibility:** Handle HTTP requests/responses, call service layer

```javascript
import * as service from './item.service.js';

export async function getAll(req, res, next) {
  try {
    const result = await service.getAll(req.query, req.user.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);  // Pass to error middleware
  }
}

export async function create(req, res, next) {
  try {
    const item = await service.create(req.body, req.user.id);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
}
```

### **4. Service Layer** (`*.service.js`)
**Responsibility:** Business logic, database operations, validation

```javascript
import { prisma } from '../../config/database.js';
import { AppError } from '../../utils/AppError.js';
import { getPagination, buildPaginatedResponse } from '../../utils/pagination.js';

export async function getAll(query, userId) {
  const { page, limit, skip } = getPagination(query);
  const where = { userId };  // Business rule: Users only see their items

  const [items, total] = await Promise.all([
    prisma.item.findMany({ where, skip, take: limit }),
    prisma.item.count({ where }),
  ]);

  return buildPaginatedResponse(items, total, { page, limit });
}

export async function create(data, userId) {
  // Business validation
  if (data.price < 0) {
    throw new AppError('Price cannot be negative', 400);
  }

  return prisma.item.create({
    data: { ...data, userId },
  });
}
```

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Authentication Middleware (`authenticate`)
Verifies JWT token and attaches user to request:

```javascript
export async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  const decoded = verifyToken(token);
  const user = await prisma.user.findUnique({ where: { id: decoded.id } });
  req.user = user;  // Attached to request for use in controllers
  next();
}
```

### Authorization Middleware (`authorize`)
Restricts endpoints to specific roles:

```javascript
export function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError('Forbidden', 403);
    }
    next();
  };
}
```

**Usage in routes:**
```javascript
// Only authenticated users
router.get('/items', authenticate, controller.getAll);

// Only admins
router.delete('/items/:id', authenticate, authorize('ADMIN'), controller.remove);

// Admins or managers
router.put('/items/:id', authenticate, authorize('ADMIN', 'MANAGER'), controller.update);
```

---

## 🛡️ ERROR HANDLING

### Centralized Error Handler

**All errors** are handled by the global error middleware:

```javascript
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Prisma-specific errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = 'A record with this value already exists';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.nodeEnv === 'development' && { stack: err.stack }),
  });
}
```

**Custom Error Class:**
```javascript
export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}
```

**Usage:**
```javascript
// In service layer
if (!user) {
  throw new AppError('User not found', 404);
}

// In controller - errors automatically caught and handled
try {
  await service.create(data);
} catch (error) {
  next(error);  // Passed to error middleware
}
```

---

## 📊 DATABASE LAYER (Prisma ORM)

### Schema Design
Each module defines its models in `prisma/schema.prisma`:

```prisma
// User model (Auth module)
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  role      Role     @default(USER)
  items     Item[]   // Relation to Item module
  bookings  Booking[] // Relation to Booking module
}

// Item model (Items module)
model Item {
  id        String   @id @default(uuid())
  title     String
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}

// Booking model (Bookings module)
model Booking {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
}
```

### Database Operations
Each service interacts with database through Prisma client:

```javascript
// Create
const item = await prisma.item.create({ data: { ... } });

// Read
const items = await prisma.item.findMany({ where: { userId } });
const item = await prisma.item.findUnique({ where: { id } });

// Update
const item = await prisma.item.update({ where: { id }, data: { ... } });

// Delete
await prisma.item.delete({ where: { id } });

// With relations
const item = await prisma.item.findUnique({
  where: { id },
  include: { user: true },  // Include related user
});
```

---

## 🔌 API DOCUMENTATION (Swagger)

Every endpoint is documented using JSDoc comments:

```javascript
/**
 * @swagger
 * /api/items:
 *   get:
 *     summary: Get all items
 *     tags: [Items]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Items retrieved successfully
 */
router.get('/', authenticate, controller.getAll);
```

Access documentation at: **http://localhost:5000/api-docs**

---

## 🚀 ADDING A NEW MODULE (Microservice)

### Step 1: Create module folder
```bash
mkdir server/src/modules/cars
```

### Step 2: Copy template
```bash
cp -r server/src/modules/items/* server/src/modules/cars/
```

### Step 3: Rename files
```
item.controller.js → car.controller.js
item.service.js → car.service.js
item.routes.js → car.routes.js
item.validation.js → car.validation.js
```

### Step 4: Update Prisma schema
```prisma
model Car {
  id          String   @id @default(uuid())
  brand       String
  model       String
  pricePerDay Decimal
  status      CarStatus @default(AVAILABLE)
  
  @@map("cars")
}

enum CarStatus {
  AVAILABLE
  RENTED
}
```

### Step 5: Update service to use new model
```javascript
// Replace prisma.item with prisma.car
const cars = await prisma.car.findMany({ ... });
```

### Step 6: Register routes
```javascript
// In app.js
import carRoutes from './modules/cars/car.routes.js';
app.use('/api/cars', carRoutes);
```

### Step 7: Run migrations
```bash
npx prisma db push
npx prisma generate
```

---

## 📈 SCALABILITY

This architecture supports future migration to **true microservices**:

1. **Each module can become a separate service**
   - Deploy `auth/` as `auth-service`
   - Deploy `modules/cars/` as `car-service`
   - Deploy `modules/bookings/` as `booking-service`

2. **Shared code becomes libraries**
   - `utils/` → npm package
   - `middleware/` → shared middleware package

3. **Database per service**
   - Each microservice gets its own database
   - Communication via REST APIs or message queues

---

## 🎓 EXAM BENEFITS

This architecture helps you:
- ✅ **Code faster** - Copy module, rename, done
- ✅ **Stay organized** - Every file has clear responsibility
- ✅ **Debug easier** - Errors show exact layer (route/controller/service)
- ✅ **Scale confidently** - Add modules without breaking existing code
- ✅ **Impress examiners** - Professional, industry-standard structure

---

Good luck! 🚀
