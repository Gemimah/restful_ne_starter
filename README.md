# RESTful National Exam Starter Template

**Exam-ready monorepo** — 

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Auth | JWT + OTP (email) |
| Docs | Swagger UI at `/api-docs` |

## Project structure

```
Restful_NE_Starter/
├── client/          # React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── routes/
│       ├── services/
│       └── utils/
├── server/          # Express API
│   ├── prisma/
│   └── src/
│       ├── auth/
│       ├── middleware/
│       ├── config/
│       ├── utils/
│       ├── docs/
│       └── modules/   # Copy `items/` for new domains
└── README.md
```

## Before the exam 

### 1. PostgreSQL

Create a database:

```sql
CREATE DATABASE ne_exam_db;
```

### 2. Backend setup

```bash
cd server
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, SMTP (optional)
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Server: http://localhost:5000  
Swagger: http://localhost:5000/api-docs

### 3. Frontend setup

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

App: http://localhost:5173

### 4. OTP in development

If SMTP is not configured, OTP is printed in the **server console** when you register.

---

## During the exam (My workflow)

### Step 1 — Clone / copy template

```bash
git clone <your-repo-url> my-exam-project
cd my-exam-project
```

### Step 2 — Rename domain 

| What to change | Where |
|----------------|-------|
| Prisma models | `server/prisma/schema.prisma` |
| DB push | `npx prisma db push` |
| API module | Copy `server/src/modules/items/` → `cars/` |
| Routes | Register in `server/src/app.js` |
| Frontend service | Copy `client/src/services/item.service.js` |
| Pages + sidebar | `client/src/pages/`, `Sidebar.jsx`, `AppRoutes.jsx` |

### Step 3 — No rebuild

- JWT middleware (`server/src/middleware/auth.middleware.js`)
- Error handler, validation, pagination
- Swagger setup
- Auth flow (register → OTP → login)
- Protected routes, Axios interceptors, layouts

---

## API endpoints (starter)

### Auth

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/auth/register` | No |
| POST | `/api/auth/verify-otp` | No |
| POST | `/api/auth/resend-otp` | No |
| POST | `/api/auth/login` | No |
| GET | `/api/auth/me` | Yes |

### Items (sample CRUD)

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/items?page=1&limit=10` | Yes |
| GET | `/api/items/:id` | Yes |
| POST | `/api/items` | Yes |
| PUT | `/api/items/:id` | Yes |
| DELETE | `/api/items/:id` | Yes |

---

## Quick checklist 

- [ ] PostgreSQL running
- [ ] `server/.env` filled in
- [ ] `npm run dev` works (server + client)
- [ ] Register → OTP (console) → Login works
- [ ] Swagger opens at `/api-docs`
- [ ] Template saved on USB + GitHub private repo


