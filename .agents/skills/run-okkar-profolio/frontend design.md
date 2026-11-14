---
## name: frontend-design
description: >
Use this skill when building any UI component, page, or layout in React.
Triggers include: diagonal split-screen layouts, dark/light mode theming,
hero sections, theme toggles, clip-path effects, CSS custom properties,
or any visual design work. If the user asks to build or style a component,
consult this skill first.


# Frontend Design Skill — React


## Core Philosophy


Commit to a bold, intentional aesthetic direction before writing any code.
Every component should feel designed, not generated.
Avoid generic patterns: no purple gradients, no Inter/Roboto, no cookie-cutter layouts.
---

## Diagonal Split-Screen Layout

Use `clip-path: polygon(...)` on layered `<div>` elements — never on `<section>` directly, as it clips child content.

### Standard diagonal (top-left light / bottom-right dark):

```css
.split-top {
  clip-path: polygon(0 0, 100% 0, 100% 42%, 0 72%);
}
.split-bottom {
  clip-path: polygon(0 72%, 100% 42%, 100% 100%, 0 100%);
}
```

- Adjust the `42%` and `72%` values to control the angle steepness
- Use `position: fixed` or `position: absolute` on both halves, full `width: 100vw; height: 100vh`
- Place content in a separate layer **above** the split backgrounds (z-index stacking)
- On mobile (`max-width: 768px`), flatten to `polygon(0 0, 100% 0, 100% 50%, 0 60%)` for a gentler cut

### React component pattern:

```jsx
// Split backgrounds sit behind; content floats above
<div className="relative w-screen h-screen overflow-hidden">
  <div className="split-top absolute inset-0 bg-[var(--color-top)]" />
  <div className="split-bottom absolute inset-0 bg-[var(--color-bottom)]" />
  <div className="relative z-10 flex flex-col items-center justify-center h-full">
    {/* content here */}
  </div>
</div>
```

---

## Dark / Light Mode — CSS Custom Properties

Define all colors as CSS variables on `:root` and swap with a `.dark` class on `<html>` or a wrapper `<div>`.

### Variable definitions (globals.css or index.css):

```css
:root {
  /* Light mode */
  --color-top: #f5f0e8; /* warm cream */
  --color-bottom: #1a1a2e; /* deep navy */
  --color-text-top: #1a1a2e;
  --color-text-bottom: #f5f0e8;
  --color-accent: #5b42f5; /* vivid indigo */
  --color-toggle-bg: #1a1a2e;
  --color-toggle-icon: #f5f0e8;
  --transition-theme: color 0.35s ease, background-color 0.35s ease;
}

.dark {
  /* Dark mode */
  --color-top: #0d0d0d;
  --color-bottom: #5b42f5; /* accent becomes the bottom half */
  --color-text-top: #f5f0e8;
  --color-text-bottom: #0d0d0d;
  --color-accent: #f5c542; /* warm gold accent in dark */
  --color-toggle-bg: #f5f0e8;
  --color-toggle-icon: #0d0d0d;
}

* {
  transition: var(--transition-theme);
}
```

### React theme toggle hook:

```jsx
// hooks/useTheme.js
import { useState, useEffect } from "react";

export function useTheme() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  return { isDark, toggle };
}
```

### Toggle button component:

```jsx
// components/ThemeToggle.jsx
import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="fixed top-5 right-5 z-50 w-10 h-10 rounded-full
                 flex items-center justify-center
                 bg-[var(--color-toggle-bg)] text-[var(--color-toggle-icon)]
                 shadow-lg transition-all duration-300 hover:scale-110"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
```

---

## Typography Rules

- **Never use** : Inter, Roboto, Arial, system-ui as primary display fonts
- **Preferred pairings** (import from Google Fonts):
  - `Syne` (display) + `DM Sans` (body)
  - `Cabinet Grotesk` (display) + `Satoshi` (body)
  - `Clash Display` (display) + `General Sans` (body)
- Display font goes on headlines (3rem+); body font on paragraphs and UI
- Use `font-feature-settings: 'ss01', 'cv01'` for stylistic alternates when available

```jsx
// In index.html or index.css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

:root {
  --font-display: 'Syne', sans-serif;
  --font-body: 'DM Sans', sans-serif;
}
```

---

## Motion & Transitions

- Theme color transitions: always use `transition` on `*` via CSS variable (see above)
- Entrance animations: use `@keyframes` or Framer Motion for staggered reveals on load
- Diagonal line animation on mount (optional but striking):

```css
@keyframes sliceIn {
  from {
    clip-path: polygon(0 0, 0 0, 0 100%, 0 100%);
  }
  to {
    clip-path: polygon(0 0, 100% 0, 100% 42%, 0 72%);
  }
}

.split-top {
  animation: sliceIn 0.8s cubic-bezier(0.77, 0, 0.18, 1) forwards;
}
```

---

## Responsiveness Checklist

- [ ] Diagonal angle flattens on mobile (< 768px)
- [ ] Font sizes use `clamp()`: e.g. `clamp(2rem, 6vw, 5rem)`
- [ ] Toggle button remains accessible (min 44x44px tap target)
- [ ] Content layer never clipped by split backgrounds
- [ ] Test both themes on mobile before shipping

---

## What NOT to Do

- ❌ Do not apply `clip-path` directly to content containers — backgrounds only
- ❌ Do not hardcode colors — always use `var(--color-*)` tokens
- ❌ Do not use `!important` to override theme variables
- ❌ Do not skip the `localStorage` persistence — theme should survive page reload
- ❌ Do not forget `aria-label` on the toggle button
