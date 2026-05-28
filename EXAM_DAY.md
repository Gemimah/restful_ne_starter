# Exam day cheat sheet

## First 10 minutes

1. Read the question — underline **entities**, **roles**, **relationships**
2. Update `schema.prisma` — rename `Item` → your entity
3. `npx prisma db push`
4. Copy `modules/items/` → `modules/your-entity/`
5. Register route in `app.js`
6. Copy frontend service + page
7. Update sidebar links

## Files you almost never touch

- `middleware/auth.middleware.js`
- `middleware/error.middleware.js`
- `middleware/validate.middleware.js`
- `utils/pagination.js`
- `utils/token.js`
- `utils/otp.js`
- `docs/swagger.js`
- `services/api.js` (Axios)
- `routes/ProtectedRoute.jsx`
- `context/AuthContext.jsx`

## Files you change every time

- `prisma/schema.prisma`
- `modules/*` (your business logic)
- `pages/*` (forms & lists)
- `components/Sidebar.jsx`
- `routes/AppRoutes.jsx`

## Prisma quick commands

```bash
npx prisma generate
npx prisma db push
npx prisma studio
```

## Common exam patterns

| Requirement | Already in template |
|-------------|---------------------|
| User registration | `POST /api/auth/register` |
| Email OTP | `POST /api/auth/verify-otp` |
| Login JWT | `POST /api/auth/login` |
| Protected routes | `authenticate` middleware |
| Pagination | `?page=1&limit=10` |
| Validation | express-validator in each module |
| API docs | `/api-docs` |
