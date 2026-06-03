# TZW LTD — Default ADMIN account (seed)

```powershell
npm run db:seed
```

## Seeded account (ADMIN only)

| Role | Email | Password |
|------|-------|----------|
| **ADMIN** | admin@tzw.com | Admin@123 |

Pre-verified — login directly, no OTP.

**INSPECTOR** and **USER** are not seeded. They register through the app; admin promotes roles under **Users**.

## Promote a registered user

Login as admin → **Users** → change role to INSPECTOR or USER.

Or psql:

```sql
UPDATE users SET role = 'INSPECTOR' WHERE email = 'someone@email.com';
```
