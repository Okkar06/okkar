## Design Scraping Rule

When given a list of reference URLs:

1. Fetch each URL and extract: color palette, fonts, spacing scale,
   component patterns, animation style, layout structure
2. Identify the common aesthetic thread across all references
3. Build a unified design_system.md summarizing the merged system
4. Apply it to the project's global CSS / Tailwind config
