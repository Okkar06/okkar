---
name: frontend
description: "Use this skill when working on the frontend of the portfolio website. Triggers include: creating or editing React components, working with Vite config, styling with Tailwind CSS, building sections (Hero, Projects, Skills, Contact), handling routing, animations, or responsive layout."
---

# frontend

## Stack
- React (functional components + hooks)
- Vite (build tool)
- JavaScript
- Tailwind CSS (utility-first styling)

## Project Structure
- /client/src/components/ — Reusable UI components (e.g. Navbar, Button, Card)
- /client/src/sections/ — Page sections (Hero, Projects, Skills, Contact)
- /client/src/assets/ — Images, icons, fonts
- /client/src/App.jsx — Root component with routing/layout
- /client/tailwind.config.js — Tailwind configuration

## Conventions
- Use functional components with hooks only (no class components)
- Use Tailwind utility classes for all styling (no inline styles or separate CSS files unless necessary)
- Keep components small and reusable
- Use props for data, avoid hardcoding content inside components
- Smooth scroll behavior enabled globally
- Mobile-first responsive design using Tailwind breakpoints (sm, md, lg, xl)

## Design Tokens
- Background: #0f0f0f or #111827
- Text: #f9fafb (light)
- Accent: Electric blue (#3b82f6) or purple (#8b5cf6)
- Font: Clean sans-serif (e.g. Inter)

## Examples
- "Add a new project card" → create/edit /client/src/components/ProjectCard.jsx
- "Fix navbar responsiveness" → edit /client/src/components/Navbar.jsx using Tailwind md: breakpoints
- "Add hover animation to button" → use Tailwind transition and hover: classes