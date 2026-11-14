---
name: run-okkar-profolio
description: Run, start, build, test, screenshot, or smoke-test the okkar_profolio portfolio website (React/Vite client + Express/Prisma API server). Use when asked to run the app, verify a feature, test the contact API, or check the frontend renders correctly.
---

# run-okkar-profolio

Personal portfolio site: React 19 + Vite 8 frontend (`client/`) and Node.js + Express + Prisma API backend (`server/`). The smoke driver is `.claude/skills/run-okkar-profolio/smoke.ps1` — it launches both servers, runs curl-style checks, and cleans up. All paths below are relative to repo root.

## Prerequisites

- Node.js (v18+) — verified with v26.2.0
- `client/node_modules` and `server/node_modules` installed:

```powershell
cd client; npm install; cd ..\server; npm install; cd ..
```

- Prisma client generated (only needed for server; safe to run with a fake DB URL):

```powershell
cd server
$env:DATABASE_URL = "postgresql://fake:fake@localhost:5432/fake"
npx prisma generate
cd ..
```

## Run — agent path (smoke driver)

```powershell
powershell -ExecutionPolicy Bypass -File .claude\skills\run-okkar-profolio\smoke.ps1
```

The script:
1. Starts the Vite dev server on `:5173`
2. Starts the Express API on `:4000` (uses a fake DATABASE_URL if `$env:DATABASE_URL` is not set — health and validation checks pass, contact POST returns 500 because no real DB)
3. Runs 4 smoke checks: HTML root, health endpoint, validation rejection (empty body), validation rejection (bad email)
4. Kills both processes on exit

To point at a real database:

```powershell
$env:DATABASE_URL = "postgresql://user:pass@host:5432/portfolio?schema=public"
powershell -ExecutionPolicy Bypass -File .claude\skills\run-okkar-profolio\smoke.ps1
```

## Run — human path

```powershell
# Terminal 1 — client
cd client; npm run dev       # http://localhost:5173

# Terminal 2 — server (needs real or fake DATABASE_URL)
cd server; $env:PORT=4000; $env:CLIENT_ORIGIN="http://localhost:5173"; npm run dev
```

Open http://localhost:5173 in a browser to see the portfolio.

## Build (client only — no server build step)

```powershell
cd client; npm run build
```

Output lands in `client/dist/`. Preview the production build:

```powershell
cd client; npx vite preview --port 4173
# → http://localhost:4173
```

## Test (server unit tests — no DB required)

```powershell
cd server
$env:DATABASE_URL = "postgresql://fake:fake@localhost:5432/fake"
npm test
```

Tests use Node's built-in `node:test` runner, bind to port 0, and pass without a live database.

## Gotchas

- **`@prisma/client did not initialize` on first run** — `npm install` alone is not enough. Run `npx prisma generate` (with any `DATABASE_URL` set) before starting the server. The generated client lands in `server/node_modules/@prisma/client`.
- **`Cannot find module 'cors'`** — `server/node_modules/` is absent. Run `cd server && npm install`.
- **Wait-Port sees "Port did not open"** — The API has no `GET /` route; the smoke driver catches 4xx responses as "server is live," which is correct. A pure TCP connection check would also work but `Invoke-WebRequest` with response-check is simpler.
- **Contact POST returns 500 with fake DB** — Expected. Prisma connects at query time, not startup. The server starts fine with a fake URL; only actual DB writes fail.
- **`pwsh` not found** — Use `powershell -ExecutionPolicy Bypass -File ...` (Windows PowerShell 5.1, which ships with Windows 11). `pwsh` (PowerShell 7+) is not always installed.
- **Client `node_modules/.bin/vite` path** — The smoke driver resolves vite via its full `node_modules/.bin/vite` path inside `Start-Process` to avoid PATH issues with background processes.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Error: @prisma/client did not initialize` | `cd server && npx prisma generate` |
| `Cannot find module 'cors'` | `cd server && npm install` |
| Vite starts but page is blank | Check browser console — likely a missing env var (`VITE_API_BASE_URL`) |
| Server starts but contact form POST returns 500 | Set a real `DATABASE_URL` with a running PostgreSQL instance |
| `Port 5173 is already in use` | Kill the other Vite process: `Get-Process node | Stop-Process` |
