---
name: seo
description: Use this skill when working on SEO for the portfolio website. Triggers include: adding meta tags, Open Graph tags, Twitter cards, sitemap, robots.txt, structured data, or improving search engine visibility.
---

# seo

## Goal
Make the portfolio discoverable on Google and shareable on social media.

## Required Meta Tags (index.html)
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="Okkar's personal portfolio — Full Stack Developer specializing in React, Node.js, and modern web technologies." />
  <meta name="keywords" content="Okkar, portfolio, full stack developer, React, Node.js, web developer" />
  <meta name="author" content="Okkar" />
  <title>Okkar | Full Stack Developer</title>

  <!-- Open Graph (Facebook, LinkedIn) -->
  <meta property="og:title" content="Okkar | Full Stack Developer" />
  <meta property="og:description" content="Personal portfolio showcasing projects, skills, and experience." />
  <meta property="og:image" content="https://okkar-portfolio.onrender.com/og-image.png" />
  <meta property="og:url" content="https://okkar-portfolio.onrender.com" />
  <meta property="og:type" content="website" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="Okkar | Full Stack Developer" />
  <meta name="twitter:description" content="Personal portfolio showcasing projects, skills, and experience." />
  <meta name="twitter:image" content="https://okkar-portfolio.onrender.com/og-image.png" />

  <!-- Canonical URL -->
  <link rel="canonical" href="https://okkar-portfolio.onrender.com" />
</head>

## robots.txt (place in /client/public/)
User-agent: *
Allow: /
Sitemap: https://okkar-portfolio.onrender.com/sitemap.xml

## sitemap.xml (place in /client/public/)
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/0.9">
  <url>
    <loc>https://okkar-portfolio.onrender.com/</loc>
    <lastmod>2024-01-01</lastmod>
    <priority>1.0</priority>
  </url>
</urlset>

## Structured Data (JSON-LD)
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Okkar",
  "url": "https://okkar-portfolio.onrender.com",
  "jobTitle": "Full Stack Developer",
  "sameAs": [
    "https://github.com/Okkar06",
    "https://linkedin.com/in/okkar"
  ]
}
</script>

## Conventions
- Every page must have a unique title and description
- OG image should be 1200x630px
- Keep meta description under 160 characters
- Use semantic HTML tags (header, main, section, footer, nav)
- All images must have descriptive alt attributes

## Examples
- "Improve Google ranking" → check meta tags, add structured data
- "Fix LinkedIn share preview" → update og:image and og:description
- "Add sitemap" → create /client/public/sitemap.xml