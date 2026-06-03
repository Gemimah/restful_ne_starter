# 🚀 MICROSERVICES ARCHITECTURE - COMPLETE SETUP GUIDE

## 📋 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (React)                          │
│                     http://localhost:5173                       │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY (Express)                      │
│                     http://localhost:5000                       │
│                  ✓ Routing  ✓ CORS  ✓ Rate Limiting            │
└──────────────┬──────────────────────────────┬───────────────────┘
               │                              │
       ┌───────▼─────────┐   ┌────────▼────────┐   ┌────────▼────────┐
       │  AUTH SERVICE   │   │ EXTINGUISHER SVC│   │ REPORTING SVC   │
       │  Port: 5001     │   │  Port: 5002     │   │  Port: 5003     │
       └────────┬────────┘   └────────┬────────┘   └────────┬────────┘
                │                     │                     │
                └─────────────────────┼─────────────────────┘
                                      │
                              ┌───────▼────────┐
                              │   PostgreSQL   │
                              │  ne_exam_db    │  ← ONE database
                              │  Port: 5432    │
                              └────────────────┘
```

### One Database, Multiple Microservices

- **One PostgreSQL database:** `ne_exam_db`
- **One Prisma schema:** `prisma/schema.prisma` (all tables)
- **One DATABASE_URL:** root `.env` file only
- Each microservice has its own **code** and **port**, but shares the same database

### Services Breakdown

1. **API Gateway (Port 5000)**
   - Single entry point for all requests
   - Routes traffic to microservices
   - Handles CORS, rate limiting, security
   - Serves Swagger documentation

2. **Auth Service (Port 5001)**
   - User registration & authentication
   - JWT token generation & validation
   - OTP email verification
   - Password hashing (bcrypt)

3. **Resource Service (Port 5002)**
   - Domain entities (Items, Cars, Products, etc.)
   - CRUD operations with pagination
   - Validates JWT by calling Auth Service
   - Rename/duplicate for exam requirements

4. **Database (PostgreSQL) — shared by ALL services**
   - Single database: `ne_exam_db`
   - Single schema file: `prisma/schema.prisma`
   - Configure `DATABASE_URL` once in root `.env`

---

## 🛠️ COMPLETE SETUP (Step-by-Step)

### STEP 1: Database Setup

```sql
-- Open pgAdmin or psql
CREATE DATABASE ne_exam_db;
```

### STEP 2: Install Dependencies

**Option A: Install all services at once (Windows)**
```bash
cd services

# Auth Service
cd auth-service
npm install
cd ..

# Resource Service
cd resource-service
npm install
cd ..

# API Gateway
cd api-gateway
npm install
cd ..

cd ..
```

**Option B: Or copy the root package.json provided below**

### STEP 3: Configure Environment Variables

**Root `.env` (ONE database for all microservices):**
```bash
copy .env.example .env
```

Edit root `.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ne_exam_db?schema=public"
```

**Each service `.env`** — PORT and service config only (no separate database):
```bash
copy services\auth-service\.env.example services\auth-service\.env
copy services\resource-service\.env.example services\resource-service\.env
copy services\reporting-service\.env.example services\reporting-service\.env
copy services\api-gateway\.env.example services\api-gateway\.env
copy client\.env.example client\.env
```

### STEP 4: Run Database Migrations (once, from root)

```bash
npm run prisma:push
```

This creates **all tables** in the **one shared database** `ne_exam_db`.

### STEP 5: Start All Services

**Option A: Manually (3 separate terminals)**

Terminal 1 - Auth Service:
```bash
cd services\auth-service
npm run dev
```

Terminal 2 - Resource Service:
```bash
cd services\resource-service
npm run dev
```

Terminal 3 - API Gateway:
```bash
cd services\api-gateway
npm run dev
```

**Option B: Using concurrently (from root — recommended)**

```bash
npm run dev          # All 4 microservices + React client
npm run services     # Backend microservices only
```

### STEP 6: Start Frontend

```bash
cd client
copy .env.example .env
npm install
npm run dev
```

---

## 🎯 VERIFY EVERYTHING IS RUNNING

### Check Health Endpoints

1. **API Gateway**: http://localhost:5000/health
   ```json
   {
     "success": true,
     "service": "api-gateway",
     "status": "running"
   }
   ```

2. **Auth Service**: http://localhost:5001/health
   ```json
   {
     "success": true,
     "service": "auth-service",
     "status": "running"
   }
   ```

3. **Resource Service**: http://localhost:5002/health
   ```json
   {
     "success": true,
     "service": "resource-service",
     "status": "running"
   }
   ```

4. **Swagger Docs**: http://localhost:5000/api-docs

5. **Frontend**: http://localhost:5173

---

## 📝 ROOT PACKAGE.JSON (already in project root)

Scripts (Windows-friendly, use `npm --prefix`):

| Script | What it does |
|--------|----------------|
| `npm run install:all` | `npm install` in auth, resource, gateway, client |
| `npm run prisma:push` | Prisma generate + db push for both services |
| `npm run services` | Auth + Resource + Gateway (concurrently) |
| `npm run dev` | All four: auth, resource, gateway, client |

Then you can:
```bash
# Install everything
npm install
npm run install:all

# Run all services + frontend
npm run dev

# Run only backend services
npm run services
```

---

## 🔄 HOW MICROSERVICES COMMUNICATE

### Authentication Flow

```
1. Client → API Gateway → Auth Service
   POST /api/auth/login
   
2. Auth Service validates credentials
   Returns JWT token

3. Client stores token

4. Client → API Gateway → Resource Service
   GET /api/items
   Header: Authorization: Bearer TOKEN
   
5. Resource Service → Auth Service
   POST /api/auth/verify-token { token: "..." }
   
6. Auth Service validates token
   Returns user info
   
7. Resource Service processes request
   Returns data to client
```

### Service Communication

**Resource Service calls Auth Service:**
```javascript
// In resource-service/src/middleware/auth.middleware.js
const response = await axios.post(
  `${AUTH_SERVICE_URL}/api/auth/verify-token`,
  { token }
);
```

**API Gateway proxies requests:**
```javascript
// In api-gateway/src/index.js
app.use('/api/auth', createProxyMiddleware({
  target: 'http://localhost:5001',
  changeOrigin: true,
}));
```

---

## 📚 FOR YOUR EXAM

### Quick Start Commands

```bash
# 1. Start PostgreSQL (ensure it's running)

# 2. Start all services (3 terminals)
cd services/auth-service && npm run dev
cd services/resource-service && npm run dev
cd services/api-gateway && npm run dev

# 3. Start frontend (4th terminal)
cd client && npm run dev

# 4. Test in browser
# - Frontend: http://localhost:5173
# - API Docs: http://localhost:5000/api-docs
```

### Adding a New Service

1. **Copy resource-service folder**
   ```bash
   cp -r services/resource-service services/booking-service
   ```

2. **Update ports** (e.g., 5003)
   - `booking-service/.env`: `PORT=5003`

3. **Update Prisma schema**
   - `booking-service/prisma/schema.prisma`: Add your models

4. **Run migrations**
   ```bash
   cd services/booking-service
   npx prisma db push
   ```

5. **Register in API Gateway**
   ```javascript
   // In api-gateway/src/index.js
   app.use('/api/bookings', createProxyMiddleware({
     target: 'http://localhost:5003',
     changeOrigin: true,
   }));
   ```

---

## 🐛 TROUBLESHOOTING

**Problem:** Service won't start
- Check port is not in use: `netstat -ano | findstr :5001`
- Kill process: `taskkill /PID <pid> /F`

**Problem:** Database connection failed
- Verify PostgreSQL is running
- Check DATABASE_URL in .env files
- Ensure database `ne_exam_db` exists

**Problem:** Auth Service unavailable (503)
- Ensure Auth Service is running on port 5001
- Check AUTH_SERVICE_URL in resource-service/.env

**Problem:** CORS errors
- Check CLIENT_URL in api-gateway/.env matches frontend port
- Ensure ALLOWED_ORIGINS includes gateway URL

---

## ✅ EXAM DAY CHECKLIST

Before you start:
- [ ] PostgreSQL running
- [ ] All .env files configured
- [ ] `npm install` completed for all services
- [ ] Database migrations run (prisma db push)
- [ ] All 4 services running (auth, resource, gateway, client)
- [ ] Can register → verify OTP → login successfully
- [ ] Swagger docs loading at /api-docs
- [ ] All health endpoints returning 200

---

Good luck with your exam! 🍀🚀
