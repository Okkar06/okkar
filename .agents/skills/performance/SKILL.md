---
name: performance
description: "Use this skill when optimizing the performance of the portfolio website. Triggers include: improving load times, lazy loading components, optimizing images, splitting Vite bundles, improving Lighthouse scores, or reducing render blocking."
---

# performance

## Goals
- Lighthouse Performance Score: 90+
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- Time to Interactive (TTI): < 3.5s

## Frontend (React + Vite)

### Code Splitting & Lazy Loading
import { lazy, Suspense } from 'react'
const Projects = lazy(() => import('./sections/Projects'))
const Skills = lazy(() => import('./sections/Skills'))

<Suspense fallback={<div>Loading...</div>}>
  <Projects />
</Suspense>

### Image Optimization
- Use WebP format for all images
- Always set width and height attributes
- Use loading="lazy" for below-fold images
- Use srcSet for responsive images
<img src="photo.webp" loading="lazy" width="400" height="300" alt="..." />

### Vite Bundle Optimization
# vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
      }
    }
  },
  chunkSizeWarningLimit: 500
}

### Tailwind Optimization
- Purge unused CSS in production (enabled by default in Tailwind v3+)
- Avoid dynamic class names (Tailwind can't detect them)

### General
- Minimize re-renders using React.memo and useCallback
- Avoid large dependencies — check bundle with: npx vite-bundle-visualizer
- Use Intersection Observer for scroll animations instead of scroll events

## Backend (Node.js)
- Enable gzip compression: npm install compression
  app.use(compression())
- Cache static responses where possible
- Keep API responses minimal — only return needed fields

## Monitoring
# Run Lighthouse audit
npx lighthouse https://your-site.onrender.com --view

## Examples
- "Page loads slowly" → check bundle size with vite-bundle-visualizer
- "Images are large" → convert to WebP, add loading="lazy"
- "Too many re-renders" → wrap component with React.memo