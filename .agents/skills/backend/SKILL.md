---
name: backend
description: "Use this skill when working on the backend of the portfolio website. Triggers include: creating or editing Express routes, middleware, API endpoints, handling CORS, environment variables, or server configuration with Node.js."
---

# backend

## Stack
- Node.js
- Express.js
- JavaScript
- dotenv (environment variables)
- CORS middleware

## Project Structure
- /server/src/routes/ — Express route handlers (e.g. contact.route.js)
- /server/src/controllers/ — Business logic for each route
- /server/src/middleware/ — Custom middleware (e.g. error handler, validation)
- /server/src/app.js — Express app setup
- /server/server.js — Entry point, starts the server
- /server/.env.example — Required environment variables template

## Conventions
- Use async/await for all async operations
- Centralize error handling in middleware
- Keep routes thin, logic in controllers
- All config via environment variables (no hardcoded values)
- Use modular structure so backend can be migrated to Cloudflare Workers later

## API Endpoints
- POST /api/contact — Accepts { name, email, message }, saves to DB via Prisma

## Examples
- "Add a new route" → create file in /server/src/routes/
- "Handle form submission" → edit /server/src/controllers/contact.controller.js
- "Add validation middleware" → edit /server/src/middleware/validate.js