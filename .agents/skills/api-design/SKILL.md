---
name: api-design
description: "Use this skill when designing or editing REST API endpoints for the portfolio backend. Triggers include: creating new routes, defining request/response structure, handling status codes, versioning, or standardizing error response formats."
---

# api-design

## Base URL
- Development: http://localhost:4000/api
- Production: https://okkar-portfolio-server.onrender.com/api

## Versioning
- Current version: /api/v1
- Example: /api/v1/contact

## Endpoints
Method  | Route              | Description
POST    | /api/v1/contact    | Submit contact form

## Request Format
POST /api/v1/contact
Content-Type: application/json
{
  "name": "string (required, max 100)",
  "email": "string (required, valid email)",
  "message": "string (required, max 1000)"
}

## Response Format
# Success
{
  "success": true,
  "message": "Message sent successfully.",
  "data": {}
}

# Error
{
  "success": false,
  "message": "Descriptive error message.",
  "errors": []
}

## HTTP Status Codes
200 - OK (GET success)
201 - Created (POST success)
400 - Bad Request (validation error)
404 - Not Found
429 - Too Many Requests (rate limited)
500 - Internal Server Error

## Conventions
- Always return JSON
- Always use success boolean in response
- Never expose stack traces in responses
- Use plural nouns for resource names
- Keep responses consistent across all endpoints

## Examples
- "Add new endpoint" → define in /server/src/routes/, handle in /server/src/controllers/
- "Return validation error" → status 400 with errors array
- "Successful form submit" → status 201 with success: true