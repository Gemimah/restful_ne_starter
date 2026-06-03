# TZW LTD — API Test Results

**Project:** Fire Extinguisher Management System (Microservices)  
**Tester:** _______________________  
**Date:** _______________________  
**Environment:** Windows / PostgreSQL / Node.js  

---

## Test Summary

| Category | Total | Passed | Failed |
|----------|-------|--------|--------|
| Auth Service | 12 | | |
| Extinguisher Service | 5 | | |
| Inspection Service | 3 | | |
| Maintenance Service | 2 | | |
| Reporting Service | 7 | | |
| Security (RBAC) | 4 | | |
| **TOTAL** | **33** | | |

---

## 1. Authentication Service (`/api/auth`)

| # | Test Case | Method | Endpoint | Expected | Pass |
|---|-----------|--------|----------|----------|------|
| 1 | Register new user | POST | `/api/auth/register` | 201, OTP sent | ☐ |
| 2 | Reject duplicate email | POST | `/api/auth/register` | 409 Conflict | ☐ |
| 3 | Verify OTP | POST | `/api/auth/verify-otp` | 200, token returned | ☐ |
| 4 | Login valid user | POST | `/api/auth/login` | 200, JWT token | ☐ |
| 5 | Login invalid password | POST | `/api/auth/login` | 401 Unauthorized | ☐ |
| 6 | Logout | POST | `/api/auth/logout` | 200 | ☐ |
| 7 | Get profile | GET | `/api/auth/me` | 200, user data | ☐ |
| 8 | Update profile | PATCH | `/api/auth/profile` | 200 | ☐ |
| 9 | Change password | POST | `/api/auth/change-password` | 200 | ☐ |
| 10 | Forgot password | POST | `/api/auth/forgot-password` | 200 | ☐ |
| 11 | Reset password | POST | `/api/auth/reset-password` | 200 | ☐ |
| 12 | List users (ADMIN) | GET | `/api/auth/users` | 200 | ☐ |

---

## 2. Fire Extinguisher Service (`/api/extinguishers`)

| # | Test Case | Method | Endpoint | Expected | Pass |
|---|-----------|--------|----------|----------|------|
| 13 | Register extinguisher | POST | `/api/extinguishers` | 201 | ☐ |
| 14 | List all | GET | `/api/extinguishers` | 200, paginated | ☐ |
| 15 | Get by ID | GET | `/api/extinguishers/:id` | 200 | ☐ |
| 16 | Update extinguisher | PUT | `/api/extinguishers/:id` | 200 | ☐ |
| 17 | Delete (ADMIN) | DELETE | `/api/extinguishers/:id` | 200 | ☐ |

---

## 3. Inspection Service (`/api/inspections`)

| # | Test Case | Method | Endpoint | Expected | Pass |
|---|-----------|--------|----------|----------|------|
| 18 | Schedule inspection | POST | `/api/inspections` | 201, notified | ☐ |
| 19 | List inspections | GET | `/api/inspections` | 200 | ☐ |
| 20 | Mark complete | PATCH | `/api/inspections/:id` | 200 | ☐ |

---

## 4. Maintenance Service (`/api/maintenance`)

| # | Test Case | Method | Endpoint | Expected | Pass |
|---|-----------|--------|----------|----------|------|
| 21 | Log maintenance | POST | `/api/maintenance` | 201 | ☐ |
| 22 | List maintenance logs | GET | `/api/maintenance` | 200 | ☐ |

---

## 5. Reporting Service (`/api/reports`)

| # | Test Case | Method | Endpoint | Expected | Pass |
|---|-----------|--------|----------|----------|------|
| 23 | Dashboard summary | GET | `/api/reports/dashboard` | 200 | ☐ |
| 24 | Inventory report | GET | `/api/reports/inventory` | 200 | ☐ |
| 25 | Inspection report | GET | `/api/reports/inspections` | 200 | ☐ |
| 26 | Compliance report | GET | `/api/reports/compliance` | 200 | ☐ |
| 27 | Maintenance report | GET | `/api/reports/maintenance` | 200 | ☐ |
| 28 | Export CSV | GET | `/api/reports/export/inventory/csv` | CSV file | ☐ |
| 29 | Export PDF | GET | `/api/reports/export/inventory/pdf` | PDF file | ☐ |

---

## 6. Security & RBAC

| # | Test Case | Expected | Pass |
|---|-----------|----------|------|
| 30 | USER cannot delete extinguisher | 403 Forbidden | ☐ |
| 31 | USER cannot log maintenance | 403 Forbidden | ☐ |
| 32 | No token on protected route | 401 Unauthorized | ☐ |
| 33 | Non-ADMIN cannot list users | 403 Forbidden | ☐ |

---

## Health Checks

| Service | URL | Status |
|---------|-----|--------|
| API Gateway | http://localhost:5000/health | ☐ |
| Auth | http://localhost:5001/health | ☐ |
| Extinguisher | http://localhost:5002/health | ☐ |
| Reporting | http://localhost:5003/health | ☐ |

---

## Notes

_Space for additional observations, bugs found, or screenshots references._

---

## Sign-off

**Tester signature:** _______________________  
**Result:** ☐ PASS  ☐ FAIL (with remarks)
