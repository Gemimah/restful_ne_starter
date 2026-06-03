# Swagger API Testing — TZW LTD

## 1. Start the system

PostgreSQL must be running and the database seeded.

```powershell
cd "C:\Users\SERUGENDO CYPRIEN\Documents\Ne_Starter\restful_ne_starter"
npm run dev
```

Wait until you see all services running:

| Service | Port |
|---------|------|
| API Gateway + **Swagger** | **5000** |
| Auth | 5001 |
| Fire Extinguisher | 5002 |
| Reporting | 5003 |
| React client | 5173 |

## 2. Open Swagger UI

In your browser:

**http://localhost:5000/api-docs**

Quick check: **http://localhost:5000/health** should return `"status": "running"`.

---

## 3. How to use Swagger UI

1. Expand a tag (e.g. **Auth**).
2. Click an endpoint (e.g. `POST /api/auth/login`).
3. Click **Try it out**.
4. Edit the JSON body (examples are pre-filled).
5. Click **Execute**.
6. Read **Response body** and **Code** (200, 201, 400, 401, 503).

### Authorize (JWT)

Most endpoints need a token:

1. Run **POST /api/auth/login** with admin credentials (below).
2. Copy the `token` value from the response (without quotes).
3. Click the green **Authorize** button at the top.
4. Enter: `Bearer YOUR_TOKEN_HERE`  
   Or paste only the token if Swagger adds `Bearer` automatically.
5. Click **Authorize**, then **Close**.

Now protected routes send `Authorization: Bearer ...`.

---

## 4. Recommended test order (exam)

### A — Login as admin (fastest)

**POST /api/auth/login**

```json
{
  "email": "admin@tzw.com",
  "password": "Admin@123"
}
```

Expected: **200** with `token` and `user.role` = `ADMIN`.

Authorize with the token, then continue.

> If login fails: run `npm run db:seed` and ensure root `.env` uses `127.0.0.1` not `localhost`.

---

### B — Auth (optional extra tests)

| Step | Endpoint | Notes |
|------|----------|--------|
| Profile | **GET /api/auth/me** | Needs Authorize |
| Users | **GET /api/auth/users** | ADMIN only |
| Register | **POST /api/auth/register** | No auth; then verify OTP |
| Verify | **POST /api/auth/verify-otp** | OTP from email or auth-service console |

Register body example:

```json
{
  "firstName": "Jane",
  "lastName": "User",
  "email": "jane@example.com",
  "password": "Pass1234"
}
```

---

### C — Fire extinguishers

1. **POST /api/extinguishers** — create one (ADMIN/INSPECTOR).
2. Copy `id` from the response.
3. **GET /api/extinguishers** — list all.
4. **GET /api/extinguishers/{id}** — paste UUID in `id`.
5. **PUT /api/extinguishers/{id}** — update location/status.
6. **DELETE /api/extinguishers/{id}** — ADMIN only.

Valid `type`: `WATER`, `CO2`, `FOAM`, `DRY_CHEMICAL`  
Valid `size`: `LB_1_5`, `LB_5`, `LB_9`, `LB_12`

---

### D — Inspections

1. **POST /api/inspections** — use real `extinguisherId` from step C.
2. **GET /api/inspections**
3. **PATCH /api/inspections/{id}** — e.g. `"status": "COMPLETED"`

`scheduledTime` must be `HH:MM` (e.g. `"10:00"`).

---

### E — Maintenance

1. **POST /api/maintenance** — same `extinguisherId`.
2. **GET /api/maintenance**

---

### F — Reports

All need Authorize (any logged-in user unless noted):

| Endpoint | Purpose |
|----------|---------|
| **GET /api/reports/dashboard** | Summary counts |
| **GET /api/reports/inventory** | Inventory |
| **GET /api/reports/inspections** | Inspections |
| **GET /api/reports/compliance** | Compliance |
| **GET /api/reports/maintenance** | Maintenance |
| **GET /api/reports/export/inventory/csv** | CSV download |
| **GET /api/reports/export/inventory/pdf** | PDF (ADMIN/INSPECTOR) |

For `{type}` use: `inventory`, `inspections`, `compliance`, or `maintenance`.

---

## 5. Common errors

| Code | Meaning | Fix |
|------|---------|-----|
| **503** | Service unavailable | Run `npm run dev` — auth/5001 or extinguisher/5002 not running |
| **401** | Unauthorized | Click **Authorize** and paste a valid JWT |
| **403** | Forbidden | Wrong role (e.g. USER cannot delete extinguisher) |
| **400** | Validation error | Read `message` — fix body fields |
| **404** | Not found | Wrong UUID or gateway path |

---

## 6. Swagger only needs the gateway?

Swagger UI runs on the **gateway** (5000), but **Execute** calls real microservices through the proxy. You must run **all backend services**, not only the gateway.

Minimum for a full test:

```powershell
npm run dev
```

Or in separate terminals: `dev:auth`, `dev:resource`, `dev:reporting`, `dev:gateway`.

---

## 7. JSON spec (optional)

Raw OpenAPI JSON: **http://localhost:5000/api-docs.json**
