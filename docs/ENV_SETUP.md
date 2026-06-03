# TZW LTD — Environment Setup (Exam Day)

Follow these steps **in order** before running `npm run dev`.

---

## STEP 1 — Start PostgreSQL

Make sure PostgreSQL is running (Windows Service or pgAdmin connected).

Default login is usually:
- **Username:** `postgres`
- **Password:** the one you set when installing PostgreSQL

---

## STEP 2 — Create the database

### Option A: pgAdmin

1. Open **pgAdmin**
2. Connect to your server
3. Right-click **Databases** → **Create** → **Database**
4. Name: `ne_exam_db`
5. Click **Save**

### Option B: SQL (Query Tool or psql)

```sql
CREATE DATABASE ne_exam_db;
```

If it already exists and you want a fresh start:

```sql
DROP DATABASE IF EXISTS ne_exam_db;
CREATE DATABASE ne_exam_db;
```

---

## STEP 3 — Root `.env` (DATABASE — one place only)

Edit this file:

```
restful_ne_starter\.env
```

Replace `YOUR_PASSWORD` with your real PostgreSQL password:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ne_exam_db?schema=public"
```

**Example** (if password is `admin123`):

```env
DATABASE_URL="postgresql://postgres:admin123@localhost:5432/ne_exam_db?schema=public"
```

> All microservices (auth, extinguisher, reporting) use this **one** database.

---

## STEP 4 — Auth service `.env` (JWT + EMAIL)

Edit:

```
restful_ne_starter\services\auth-service\.env
```

### Required for login/security

```env
JWT_SECRET=tzw-ltd-super-secret-key-change-in-production-2026
JWT_EXPIRES_IN=7d
OTP_EXPIRES_MINUTES=10
```

### Email for OTP (choose ONE option)

#### Option A — No email (easiest for exam testing)

Leave Gmail fields as-is **empty or placeholder**. OTP will print in the **auth service terminal**:

```
[DEV] OTP for you@gmail.com: 123456
```

Set:

```env
SMTP_USER=
SMTP_PASS=
```

#### Option B — Gmail (real OTP emails)

1. Use a Gmail account
2. Enable **2-Step Verification** on Google Account
3. Create an **App Password**: Google Account → Security → App passwords
4. Fill in:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.real.email@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM="TZW LTD <your.real.email@gmail.com>"
```

---

## STEP 5 — Other service `.env` files (quick check)

Copy if missing:

```powershell
cd "c:\Users\SERUGENDO CYPRIEN\Documents\Ne_Starter\restful_ne_starter"
copy services\resource-service\.env.example services\resource-service\.env
copy services\reporting-service\.env.example services\reporting-service\.env
copy services\api-gateway\.env.example services\api-gateway\.env
copy client\.env.example client\.env
```

These do **not** need DATABASE_URL (only root `.env` has it).

Optional: copy same Gmail settings to `services\resource-service\.env` for inspection email notifications.

---

## STEP 6 — Create tables (migrate)

From project root:

```powershell
npm run prisma:push
```

You should see: **Your database is now in sync with your Prisma schema.**

If you get **Authentication failed** → wrong password in root `.env`.

---

## STEP 7 — Run the app

```powershell
npm run dev
```

Open:
- App: http://localhost:5173
- Swagger: http://localhost:5000/api-docs (see [SWAGGER_TESTING.md](./SWAGGER_TESTING.md))

---

## STEP 8 — First test user

1. Register at http://localhost:5173/register
2. Get OTP from email OR auth terminal (`[DEV] OTP for...`)
3. Verify OTP → Login
4. Make yourself ADMIN (pgAdmin → Query Tool):

```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## Files checklist

| File | What to set |
|------|-------------|
| `.env` (root) | `DATABASE_URL` with your postgres password |
| `services/auth-service/.env` | `JWT_SECRET`, email (optional) |
| `services/resource-service/.env` | PORT, AUTH_SERVICE_URL (defaults OK) |
| `services/reporting-service/.env` | PORT, AUTH_SERVICE_URL (defaults OK) |
| `services/api-gateway/.env` | PORT, service URLs (defaults OK) |
| `client/.env` | `VITE_API_URL=http://localhost:5000/api` |

---

## Quick troubleshoot

| Error | Fix |
|-------|-----|
| `P1000 Authentication failed` | Wrong password in root `.env` |
| `database "ne_exam_db" does not exist` | Run `CREATE DATABASE ne_exam_db;` |
| OTP not received | Check auth terminal for `[DEV] OTP` |
| Port in use | `netstat -ano \| findstr :5001` then kill process |
