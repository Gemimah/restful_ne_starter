# Shared database schema

All microservices use **one schema file** at the project root:

```
prisma/schema.prisma
```

Run migrations from the **project root** only:

```bash
npm run prisma:push
```

Do not create separate databases per service.
