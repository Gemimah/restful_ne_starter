# 🚀 EXAM QUICK START GUIDE

## ⚡ SETUP (5 minutes)

### 1️⃣ Database Setup
```sql
-- Open PostgreSQL (pgAdmin or psql)
CREATE DATABASE ne_exam_db;
```

### 2️⃣ Backend Setup
```bash
cd server

# Copy and edit .env file
copy .env.example .env

# Edit .env and set:
# DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ne_exam_db?schema=public"
# JWT_SECRET=your-long-random-secret-key-here

npm install
npx prisma generate
npx prisma db push
npm run dev
```

**Server will run at:** http://localhost:5000  
**Swagger API Docs:** http://localhost:5000/api-docs

### 3️⃣ Frontend Setup
```bash
cd client

# Copy .env file
copy .env.example .env

npm install
npm run dev
```

**App will run at:** http://localhost:5173

---

## 📋 EXAM WORKFLOW (Step-by-step)

### STEP 1: Read the exam question carefully
- **Identify entities** (e.g., Car, Booking, Product, Order)
- **Identify relationships** (e.g., User has many Bookings)
- **Identify special requirements** (e.g., only ADMIN can delete, status transitions)

### STEP 2: Update Prisma Schema (5-10 min)

**File:** `server/prisma/schema.prisma`

**Example:** If exam asks for "Car Rental System"

```prisma
model Car {
  id          String   @id @default(uuid())
  brand       String
  model       String
  year        Int
  pricePerDay Decimal  @db.Decimal(10, 2)
  status      CarStatus @default(AVAILABLE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  bookings    Booking[]

  @@map("cars")
}

model Booking {
  id          String   @id @default(uuid())
  carId       String
  car         Car      @relation(fields: [carId], references: [id])
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  startDate   DateTime
  endDate     DateTime
  totalPrice  Decimal  @db.Decimal(10, 2)
  status      BookingStatus @default(PENDING)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("bookings")
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

**Don't forget to update User model:**
```prisma
model User {
  // ... existing fields
  bookings Booking[]  // Add this relation
}
```

**Run migrations:**
```bash
npx prisma db push
npx prisma generate
```

### STEP 3: Create Backend Module (10-15 min)

**Copy the items module:**
```bash
cd server/src/modules
cp -r items cars
```

**Update files in `cars/` folder:**

1. **car.controller.js** - Rename `item` → `car`
2. **car.service.js** - Update Prisma calls from `prisma.item` → `prisma.car`
3. **car.routes.js** - Update endpoint paths and Swagger tags
4. **car.validation.js** - Update validation rules for your entity fields

**Register route in `server/src/app.js`:**
```javascript
import carRoutes from './modules/cars/car.routes.js';

app.use('/api/cars', carRoutes);
```

### STEP 4: Create Frontend Module (10-15 min)

**Copy service:**
```bash
cd client/src/services
# Copy item.service.js to car.service.js
```

**Update `car.service.js`:**
```javascript
export const carService = {
  getAll: (params) => api.get('/cars', { params }),
  getById: (id) => api.get(`/cars/${id}`),
  create: (data) => api.post('/cars', data),
  update: (id, data) => api.put(`/cars/${id}`, data),
  remove: (id) => api.delete(`/cars/${id}`),
};
```

**Create page:**
```bash
cd client/src/pages
# Copy ItemsPage.jsx to CarsPage.jsx
```

**Update `CarsPage.jsx`:**
- Replace all `item` references with `car`
- Update form fields to match your entity (brand, model, year, pricePerDay)
- Import `carService` instead of `itemService`

**Update routes in `client/src/routes/AppRoutes.jsx`:**
```javascript
import CarsPage from '../pages/CarsPage.jsx';

// Add route
<Route path="/cars" element={<CarsPage />} />
```

**Update sidebar in `client/src/components/Sidebar.jsx`:**
```javascript
const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/cars', label: 'Cars' },
];
```

---

## 🎯 COMMON EXAM PATTERNS

### Pattern 1: Role-Based Access Control

**Requirement:** "Only ADMIN can delete cars"

```javascript
// In car.routes.js
import { authenticate, authorize } from '../../middleware/auth.middleware.js';

router.delete('/:id', 
  authenticate, 
  authorize('ADMIN'),  // Add this
  itemIdValidation, 
  validate, 
  carController.remove
);
```

### Pattern 2: Custom Filters

**Requirement:** "Users can filter cars by status and price range"

```javascript
// In car.service.js
export async function getAll(query, userId) {
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
```

### Pattern 3: Nested Resources

**Requirement:** "Get all bookings for a specific car"

```javascript
// In car.routes.js
router.get('/:id/bookings', authenticate, carController.getCarBookings);

// In car.controller.js
export async function getCarBookings(req, res, next) {
  try {
    const bookings = await carService.getCarBookings(req.params.id);
    res.json({ success: true, data: bookings });
  } catch (error) {
    next(error);
  }
}

// In car.service.js
export async function getCarBookings(carId) {
  return prisma.booking.findMany({
    where: { carId },
    include: { user: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
```

### Pattern 4: Status Transitions

**Requirement:** "Booking status must follow: PENDING → CONFIRMED → COMPLETED"

```javascript
// In booking.service.js
export async function updateStatus(id, newStatus, userId) {
  const booking = await getById(id, userId);

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

  return prisma.booking.update({
    where: { id },
    data: { status: newStatus },
  });
}
```

---

## 🔥 EXAM DAY CHECKLIST

**Before you start coding:**
- [ ] PostgreSQL is running
- [ ] Both `server/.env` and `client/.env` are configured
- [ ] `npm install` completed for both server and client
- [ ] Both servers running (`npm run dev`)
- [ ] You can register → verify OTP → login successfully
- [ ] Swagger docs load at http://localhost:5000/api-docs

**While coding:**
- [ ] Read question 2-3 times, underline key requirements
- [ ] Update Prisma schema first, run `npx prisma db push`
- [ ] Copy `items/` module, rename all functions and imports
- [ ] Test each endpoint in Swagger before moving to frontend
- [ ] Update frontend service → page → routes → sidebar
- [ ] Test in browser before submission

**Before submission:**
- [ ] All required endpoints work (test in Swagger)
- [ ] Frontend displays data correctly
- [ ] No console errors in browser or terminal
- [ ] Code is clean (remove console.logs)
- [ ] All validation rules work correctly

---

## 🆘 TROUBLESHOOTING

**Problem:** `prisma.item is not a function`  
**Solution:** You forgot to rename in service file OR didn't run `npx prisma generate`

**Problem:** Route not found (404)  
**Solution:** Check if you registered route in `app.js`

**Problem:** OTP not received  
**Solution:** Check server console — OTP is printed there if SMTP not configured

**Problem:** Frontend 401 errors  
**Solution:** Make sure you're logged in and token is stored (check localStorage in browser DevTools)

**Problem:** Relation field error  
**Solution:** Make sure you added the relation to BOTH models in schema.prisma

**Problem:** CORS errors  
**Solution:** Check `CLIENT_URL` in server `.env` matches frontend port (5173)

---

## 💡 PRO TIPS

1. **Start with backend** — Get API working first, then build UI
2. **Use Swagger** — Test all endpoints before touching frontend
3. **Copy-paste smart** — Copy items module, search/replace "item" → "yourEntity"
4. **Keep it simple** — Don't over-engineer, finish requirements first
5. **Test as you go** — Don't wait until the end to test
6. **Use Prisma Studio** — Run `npx prisma studio` to see database visually
7. **Read error messages** — Prisma and Express give helpful error messages

---

## 📚 QUICK REFERENCES

**Prisma Common Types:**
- `String` - Text
- `Int` - Integer number
- `Decimal` - Decimal number (for money)
- `Boolean` - true/false
- `DateTime` - Date and time
- `@db.Decimal(10, 2)` - 10 digits, 2 decimal places

**Prisma Relations:**
- `@relation(fields: [foreignKey], references: [id])` - Defines FK
- `model[]` - One-to-many (e.g., `bookings Booking[]`)
- `model` - Many-to-one (e.g., `user User`)

**Express Validation Common Rules:**
```javascript
body('email').isEmail()
body('field').notEmpty()
body('field').isLength({ min: 6 })
body('field').isInt()
body('field').isDecimal()
body('field').isIn(['VALUE1', 'VALUE2'])
body('field').optional()
```

---

Good luck on your exam! 🍀
