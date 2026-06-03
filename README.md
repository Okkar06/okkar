# okkar_portfolio

Personal portfolio website built with:
- Frontend: React + Vite + Tailwind CSS (`/client`)
- Backend: Node.js + Express + Prisma (`/server`)
- Database: PostgreSQL (Supabase compatible via `DATABASE_URL`)

## Setup

1. Copy `.env.example` values into environment variables for local/dev deployment.
2. Install dependencies:
   - `cd client && npm install`
   - `cd server && npm install`
3. Generate Prisma client and run migrations on your PostgreSQL database:
   - `cd server && npm run prisma:generate`
   - `cd server && npm run prisma:migrate`
4. Start services:
   - Frontend: `cd client && npm run dev`
   - Backend: `cd server && npm run dev`

## Deployment

A `render.yaml` file is included to deploy:
- `okkar-portfolio-api` as a Node web service
- `okkar-portfolio-client` as a static site
