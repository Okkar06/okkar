---
name: deployment
description: "Use this skill when working on deployment configuration for the portfolio website. Triggers include: editing render.yaml, setting up environment variables, configuring build commands, or preparing for migration to Cloudflare."
---

# deployment

## Current: Render
- Frontend: Render Static Site (React + Vite build)
- Backend: Render Web Service (Node.js)
- Database: Render managed PostgreSQL

## Future: Cloudflare
- Frontend: Cloudflare Pages
- Backend: Cloudflare Workers (keep backend modular for easy migration)

## Project Structure
- /render.yaml — Render services config
- /.env.example — Required environment variables
- /client/vite.config.js — Vite build config for frontend
- /server/server.js — Entry point for Node.js backend

## render.yaml Structure
services:
  - type: web
    name: okkar-portfolio-server
    env: node
    buildCommand: cd server && npm install && npx prisma migrate deploy
    startCommand: cd server && node server.js
    envVars:
      - key: DATABASE_URL
        sync: false
      - key: PORT
        value: 4000

  - type: static
    name: okkar-portfolio-client
    buildCommand: cd client && npm install && npm run build
    staticPublishPath: ./client/dist

## Conventions
- All secrets via environment variables (never hardcoded)
- Keep backend logic in plain JS modules (no Render-specific SDKs)
- Vite base URL should use env variable for API base URL
- Test production build locally with: npm run build && npm run preview

## Examples
- "Deploy to Render" → push to main branch, Render auto-deploys
- "Add new env variable" → add to render.yaml and .env.example
- "Prepare for Cloudflare migration" → refactor Express routes to be framework-agnostic