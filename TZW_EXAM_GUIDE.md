# TZW LTD — Exam Quick Start

## Architecture: Microservices + ONE Shared Database

```
                    ┌─────────────────┐
                    │  React Client   │  :5173
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   API Gateway   │  :5000  (+ Swagger)
                    └────────┬────────┘
         ┌───────────────────┼───────────────────┐
         │                   │                   │
  ┌──────▼──────┐   ┌────────▼────────┐  ┌──────▼──────┐
  │ Auth Service│   │ Extinguisher Svc│  │  Reporting  │
  │    :5001    │   │     :5002       │  │    :5003    │
  └──────┬──────┘   └────────┬────────┘  └──────┬──────┘
         │                   │                   │
         └───────────────────┼───────────────────┘
                             │
                    ┌────────▼────────┐
                    │   PostgreSQL    │
                    │   ne_exam_db    │  ← ONE database for ALL services
                    └─────────────────┘
```

- **4 microservices** (auth, extinguisher, reporting, gateway) — separate code & ports
- **1 PostgreSQL database** (`ne_exam_db`) — shared by all services
- **1 Prisma schema** (`prisma/schema.prisma`) — all tables in one place

## Setup

```powershell
# 1. Edit root .env — set YOUR PostgreSQL password
#    restful_ne_starter\.env

# 2. Create database in pgAdmin:
#    CREATE DATABASE ne_exam_db;

# 3. Install everything + migrate (one command)
npm run setup

# 4. Run ALL microservices + frontend with concurrently
npm run dev
```

## Concurrently commands

| Command | What runs |
|---------|-----------|
| `npm run dev` | Auth + Extinguisher + Reporting + Gateway + React (5 processes) |
| `npm run services` | Backend only (4 processes, no React) |

## Database config (ONE place only)

File: **`restful_ne_starter\.env`**

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ne_exam_db?schema=public"
```

Service `.env` files only have **PORT**, **JWT**, etc. — NOT separate databases.

## Exam deliverables

| Document | Path |
|----------|------|
| User Manual | `docs/USER_MANUAL.md` |
| Test Results template | `docs/TEST_RESULTS.md` |
| ERD | `docs/ERD.md` |
| Database backup | `npm run db:backup` → `backups/` |

## Database backup

```powershell
npm run db:backup
# or: .\scripts\backup-database.ps1
```

Creates `backups/ne_exam_db_YYYY-MM-DD.sql`. Restore with:

```powershell
psql -U postgres -d ne_exam_db -f backups\your_backup.sql
```
