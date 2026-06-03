# TZW LTD — Fire Extinguisher Management System
## User Manual

**Version:** 1.0  
**Architecture:** RESTful Microservices  
**Company:** TZW LTD — Fire safety equipment management

---

## 1. Introduction

This system helps TZW LTD manage fire extinguishers across commercial and industrial facilities. Users can:

- Check extinguisher status
- Schedule inspections
- Log maintenance activities
- Monitor compliance
- Generate real-time reports

---

## 2. Getting Started

### 2.1 Access the application

- **Web app:** http://localhost:5173
- **API documentation:** http://localhost:5000/api-docs

### 2.2 Create an account

1. Click **Register**
2. Enter **First Name**, **Last Name**, **Email**, **Password**
3. Check your email for a **6-digit OTP** (or check the auth service terminal in development)
4. Enter OTP on the verification page
5. Sign in with your email and password

### 2.3 Forgot password

1. Click **Forgot password?** on the login page
2. Enter your email
3. Use the OTP sent to reset your password

---

## 3. User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Manage users, delete extinguishers, full system access |
| **INSPECTOR** | Register/update extinguishers, log maintenance, complete inspections |
| **USER** | View extinguishers, schedule inspections, view reports |

> New users register as **USER**. An ADMIN can change roles under **Users** in the sidebar.

---

## 4. Using the Dashboard

The dashboard shows live counts:

- Total extinguishers
- Pending / overdue inspections
- Compliance status

---

## 5. Fire Extinguishers

### View list
Go to **Extinguishers** to see all registered units.

### View details
Click **View** on any row to see full details including recent inspections and maintenance.

### Register (ADMIN / INSPECTOR)
Fill in:
- Serial Number
- Location
- Type (Water, CO₂, Foam, Dry Chemical)
- Size (1.5, 5, 9, 12 lb)
- Installation & expiry dates
- Status

### Edit (ADMIN / INSPECTOR)
Click **Edit**, update fields, then **Save Changes**.

### Delete (ADMIN only)
Click **Delete** and confirm.

---

## 6. Inspections

1. Go to **Inspections**
2. Select an extinguisher
3. Choose **date** and **time**
4. Add optional notes
5. Click **Schedule Inspection**

Relevant personnel receive an email notification (or a console log in development).

Inspectors/Admins can mark pending inspections as **Complete**.

---

## 7. Maintenance

Inspectors and Admins can log maintenance:

- Select extinguisher
- Action taken
- Date
- Issues identified
- Notes and recommendations

---

## 8. Reports

Go to **Reports** for:

- **Inventory** — total, daily, monthly, yearly counts
- **Inspections** — pending, completed, overdue
- **Compliance** — expired units, upcoming expirations
- **Maintenance** — history and frequency

**Export:** Click **CSV** or **PDF** (ADMIN / INSPECTOR).

---

## 9. Profile

Under **Profile** you can:

- Update name and email
- Change password

---

## 10. Admin — User Management

ADMIN users see **Users** in the sidebar:

- View all registered accounts
- Change user roles (ADMIN, INSPECTOR, USER)

---

## 11. Support & API

For developers and testers, all REST APIs are documented at:

**http://localhost:5000/api-docs**

Use **Authorize** with your JWT token (`Bearer <token>`) for protected endpoints.

---

## 12. Troubleshooting

| Problem | Solution |
|---------|----------|
| Cannot login | Verify email with OTP first |
| 403 Forbidden | Your role may not allow this action |
| OTP not received | Check auth service terminal for `[DEV] OTP` |
| Services not loading | Run `npm run dev` from project root |

---

**TZW LTD** — Fire Extinguisher Management System © 2026
