# okkar_portfolio

Personal portfolio website with an arcade theme.

- **Frontend** (`/client`): React + Vite + Tailwind CSS
- **Backend** (`/server`): Node.js + Express + Prisma
- **Database**: PostgreSQL (Supabase compatible via `DATABASE_URL`)

In production one Express service serves both the API and the built client.

## Setup

1. Copy `.env.example` to `.env` (repo root or `server/`) and fill it in.
   The server refuses to start, with a message naming the problem, if a
   required variable is missing or malformed.
2. Install dependencies:
   - `cd client && npm install`
   - `cd server && npm install`
3. Generate the Prisma client and run migrations:
   - `cd server && npm run prisma:generate`
   - `cd server && npm run prisma:migrate`
4. Start both:
   - Frontend: `cd client && npm run dev` → http://localhost:5173
   - Backend: `cd server && npm run dev` → http://localhost:4000

## Checking your work

From the repo root:

| Command | What it does |
| --- | --- |
| `npm run verify` | Lint, build the client, then run every test. Run this before pushing. |
| `npm test` | Server tests (`node:test`) and client tests (Vitest). |
| `npm run lint` | ESLint on the client. |
| `npm run build` | Production build of the client into `client/dist`. |

The tests need no database. A few server tests check the built client and
are skipped until `client/dist` exists, which is why `verify` builds first.

## Editing the site

- **Content** (name, bio, projects, skills, links): `client/src/data/content.js`.
- **Theme colours**: see [client/README.md](client/README.md). One picked
  colour drives the whole look; no colour is written anywhere else.

## API

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Liveness check (used by Render). Not rate limited. |
| `POST` | `/api/contacts` | Contact form: `{ name, email, message }`. |

Responses are always `{ success: true, data }` or
`{ success: false, error: { code, message, fields? } }`.

## Deployment

`render.yaml` deploys a single Node web service named `okkar`: it builds the
client, runs migrations, and starts Express, which serves the API and the
static client. Render uses `/api/health` as the health check.

Set `DATABASE_URL` in the Render dashboard. If the site's URL is not
`https://okkar.onrender.com`, update `ALLOWED_ORIGINS` in `render.yaml`.
