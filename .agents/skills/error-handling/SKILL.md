---
name: error-handling
description: Use this skill when implementing error handling in the portfolio website. Triggers include: adding React error boundaries, handling API errors, showing user-friendly error messages, logging errors, or handling network failures gracefully.
---

# error-handling

## Frontend (React)

### Error Boundary Component
# /client/src/components/ErrorBoundary.jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error, info) { console.error(error, info) }
  render() {
    if (this.state.hasError)
      return <div>Something went wrong. Please refresh the page.</div>
    return this.props.children
  }
}

### API Error Handling
const submitContact = async (formData) => {
  try {
    const res = await fetch('/api/v1/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    if (!res.ok) throw new Error('Submission failed')
    const data = await res.json()
    return data
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

### User Feedback States
- Loading: show spinner while submitting
- Success: show success message after submit
- Error: show friendly error message (never raw error)
- Network error: "Unable to connect. Please check your connection."

## Backend (Node.js + Express)

### Global Error Handler Middleware
# /server/src/middleware/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`)
  const status = err.status || 500
  res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong.'
      : err.message
  })
}
export default errorHandler

### Not Found Handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' })
})

### Async Error Wrapper
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

export default asyncHandler

### Prisma Error Handling
try {
  await prisma.contact.create({ data })
} catch (error) {
  if (error.code === 'P2002') {
    throw { status: 400, message: 'Duplicate entry.' }
  }
  throw { status: 500, message: 'Database error.' }
}

## Conventions
- Never show raw errors or stack traces to users in production
- Always log errors server-side for debugging
- Use consistent error response format: { success: false, message: '' }
- Handle all promise rejections and async errors

## Examples
- "API call fails silently" → wrap in try/catch, show error state in UI
- "App crashes on error" → wrap sections in ErrorBoundary
- "Database error leaks to client" → use global error handler middleware