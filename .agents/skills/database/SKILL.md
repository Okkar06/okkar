---
name: database
description: "Use this skill when working with the database layer of the portfolio website. Triggers include: editing Prisma schema, writing queries, running migrations, seeding data, or managing the PostgreSQL database connection."
---

# database

## Stack
- Prisma ORM
- PostgreSQL (Render managed DB for now)
- dotenv for DATABASE_URL

## Project Structure
- /server/prisma/schema.prisma — Prisma schema file
- /server/prisma/migrations/ — Auto-generated migration files
- /server/prisma/seed.js — Optional seed script
- /server/src/lib/prisma.js — Prisma client singleton

## Prisma Schema
model Contact {
  id        Int      @id @default(autoincrement())
  name      String
  email     String
  message   String
  createdAt DateTime @default(now())
}

## Conventions
- Always use a Prisma client singleton (instantiate once, reuse everywhere)
- Run migrations with: npx prisma migrate dev
- Never commit .env — use .env.example as template
- Use npx prisma studio to inspect data locally

## Examples
- "Add a new model" → edit /server/prisma/schema.prisma, then run migration
- "Query contact submissions" → use prisma.contact.findMany() in controller
- "Reset database" → npx prisma migrate reset