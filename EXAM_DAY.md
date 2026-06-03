# Exam day — quick reference

## One-time setup (do this tonight or before the exam)

```powershell
# 1. Create database in pgAdmin or psql
#    CREATE DATABASE ne_exam_db;

# 2. From project root
cd "c:\Users\SERUGENDO CYPRIEN\Documents\Ne_Starter\restful_ne_starter"
npm install
npm run install:all

# 3. Copy .env files (edit YOUR_PASSWORD in DATABASE_URL)
copy services\auth-service\.env.example services\auth-service\.env
copy services\resource-service\.env.example services\resource-service\.env
copy services\api-gateway\.env.example services\api-gateway\.env
copy client\.env.example client\.env

# 4. Migrations
npm run prisma:push
```

## Start everything (exam morning)

```powershell
# PostgreSQL must be running first

# Option A — one terminal (recommended)
npm run dev

# Option B — backend only, frontend in another terminal
npm run services
# then: npm run dev:client
```

## Health checks (browser)

| What | URL |
|------|-----|
| Gateway | http://localhost:5000/health |
| Auth | http://localhost:5001/health |
| Resource | http://localhost:5002/health |
| Swagger | http://localhost:5000/api-docs |
| React app | http://localhost:5173 |

## Ports

| Service | Port |
|---------|------|
| API Gateway | 5000 |
| Auth | 5001 |
| Resource | 5002 |
| PostgreSQL | 5432 |
| React (Vite) | 5173 |

## If something fails

```powershell
# Port in use?
netstat -ano | findstr :5001
taskkill /PID <pid> /F

# Reset DB schema
npm run prisma:push
```

## Typical exam tasks

1. **Rename resource** — duplicate `resource-service`, change model/routes (e.g. Items → Cars).
2. **New microservice** — copy `resource-service`, new `PORT`, `prisma db push`, add proxy in `api-gateway/src/index.js`.
3. **Auth** — always goes through gateway: `/api/auth/*` → port 5001.

Full guide: `MICROSERVICES_SETUP.md`
