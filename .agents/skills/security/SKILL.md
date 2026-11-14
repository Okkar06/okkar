---
name: security
description: "Use this skill when working on any security-related aspect of the portfolio website. Triggers include: handling environment variables, securing API endpoints, setting up CORS, HTTP headers, rate limiting, input validation, sanitization, dependency security, or preparing the app for public deployment."
---

# security

## Core Principles
- Never expose secrets or API keys in frontend code or GitHub
- Always validate and sanitize user inputs (especially contact form)
- Follow OWASP Top 10 best practices
- Keep all dependencies up to date

## Environment Variables
- Never hardcode secrets — always use .env
- Never commit .env to GitHub — ensure .gitignore includes it
- Always maintain .env.example with placeholder values
- Required variables:
  DATABASE_URL=
  PORT=
  CORS_ORIGIN=
  RATE_LIMIT_WINDOW_MS=
  RATE_LIMIT_MAX=

## Backend Security (Node.js + Express)

### Required Packages
npm install helmet cors express-rate-limit express-validator xss-clean hpp

### Helmet (HTTP Security Headers)
import helmet from 'helmet'
app.use(helmet())
# Enables: CSP, HSTS, X-Frame-Options, X-XSS-Protection, etc.

### CORS
import cors from 'cors'
app.use(cors({
  origin: process.env.CORS_ORIGIN,  # whitelist frontend URL only
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}))

### Rate Limiting
import rateLimit from 'express-rate-limit'
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  # 15 minutes
  max: 100,                   # max 100 requests per window
  message: 'Too many requests, please try again later.'
})
app.use('/api/', limiter)

# Stricter limiter for contact form
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,  # 1 hour
  max: 5,                     # max 5 submissions per hour
  message: 'Too many submissions, please try again later.'
})
app.use('/api/contact', contactLimiter)

### Input Validation & Sanitization
import { body, validationResult } from 'express-validator'
import xss from 'xss-clean'
import hpp from 'hpp'

app.use(xss())   # sanitize request data against XSS
app.use(hpp())   # prevent HTTP parameter pollution

# Contact form validation rules
body('name').trim().notEmpty().isLength({ max: 100 }).escape()
body('email').trim().normalizeEmail().isEmail()
body('message').trim().notEmpty().isLength({ max: 1000 }).escape()

### Error Handling
# Never expose stack traces or internal errors publicly
app.use((err, req, res, next) => {
  console.error(err.stack)   # log internally only
  res.status(500).json({ message: 'Something went wrong.' })
})

## Database Security (Prisma)
- Always use Prisma parameterized queries (never raw SQL with user input)
- Restrict database user permissions to minimum required
- Rotate DATABASE_URL credentials regularly
- Never expose Prisma errors directly to the client

## Frontend Security (React + Vite)
- Never store sensitive data in localStorage or sessionStorage
- Never put API keys or secrets in frontend code or .env.local that gets committed
- Sanitize any dynamic content rendered from user input
- Use HTTPS only in production
- Set Vite env variables with VITE_ prefix for public vars only

## Dependency Security
# Check for vulnerabilities regularly
npm audit
npm audit fix

# Keep dependencies updated
npm outdated
npm update

# Check for known vulnerabilities
npx snyk test

## GitHub Security
- Add .env to .gitignore immediately (before first commit)
- Enable GitHub Dependabot alerts on the repo
- Enable GitHub secret scanning on the repo
- Never force push to main branch
- Use branch protection rules on main

## .gitignore Must Include
.env
.env.local
.env.production
node_modules/
dist/
.DS_Store

## Security Headers Checklist (via Helmet)
- Content-Security-Policy (CSP) ✓
- Strict-Transport-Security (HSTS) ✓
- X-Frame-Options: DENY ✓
- X-Content-Type-Options: nosniff ✓
- Referrer-Policy ✓
- Permissions-Policy ✓

## Deployment Security (Render)
- Set all environment variables in Render dashboard (never in code)
- Enable HTTPS (Render provides SSL by default)
- Restrict database access to backend service only
- Set NODE_ENV=production in Render environment

## Examples
- "Secure the contact form" → add contactLimiter + express-validator rules
- "Add security headers" → app.use(helmet()) in app.js
- "Check for vulnerabilities" → run npm audit && npx snyk test
- "Env variable missing" → add to .env.example and Render dashboard