import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, sep } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Guard rail: colour is defined in src/theme (and its generated fallback,
 * styles/tokens.css) and nowhere else. If this fails, replace the literal
 * with a theme token: rgb(var(--c-...)) in CSS, or a Tailwind token class.
 */
// Vitest runs from the client package root.
const clientRoot = process.cwd()

const SCANNED = ['src', 'public', 'index.html', 'tailwind.config.js']
const EXTENSIONS = /\.(jsx?|css|html)$/

// The single source of truth and its generated output.
const ALLOWED = [join('src', 'theme') + sep, join('src', 'styles', 'tokens.css')]

const PATTERNS = [
  [/#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})\b/gi, 'hex colour'],
  [/\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(\s*[\d.]/gi, 'colour function with literal channels'],
]

// In-page links (href="#about", '#top') and HTML entities (&#39;) start with a
// hash but are not colours.
const isAnchorOrEntity = (line, index) => /(?:["'`]|&)$/.test(line.slice(0, index))

function* walk(path) {
  if (statSync(path).isDirectory()) {
    for (const entry of readdirSync(path)) yield* walk(join(path, entry))
  } else if (EXTENSIONS.test(path)) {
    yield path
  }
}

function findColourLiterals(text) {
  const found = []
  text.split('\n').forEach((line, lineIndex) => {
    for (const [pattern, kind] of PATTERNS) {
      for (const match of line.matchAll(pattern)) {
        if (kind === 'hex colour' && isAnchorOrEntity(line, match.index)) continue
        found.push({ line: lineIndex + 1, kind, value: match[0] })
      }
    }
  })
  return found
}

describe('no stray colours', () => {
  it('the scanner recognises colour literals and ignores links', () => {
    const sample = [
      'color: #3b82f6;',
      'background: rgba(0, 0, 0, 0.5);',
      'fill: hsl(210 50% 40%);',
      'border-color: #FFF;',
      '<a href="#about">About</a>',
      "{ label: 'Contact', href: '#contact' }",
      'color: rgb(var(--c-wall) / 0.4);',
      'rgb(var(--c-glow) / calc(0.24 * var(--glow-strength)))',
    ].join('\n')

    expect(findColourLiterals(sample).map((hit) => hit.value)).toEqual([
      '#3b82f6',
      'rgba(0',
      'hsl(2',
      '#FFF',
    ])
  })

  it('finds no colour literals outside src/theme', () => {
    const offenders = []

    for (const entry of SCANNED) {
      for (const file of walk(join(clientRoot, entry))) {
        const name = relative(clientRoot, file)
        if (ALLOWED.some((allowed) => name.startsWith(allowed))) continue

        for (const hit of findColourLiterals(readFileSync(file, 'utf8'))) {
          offenders.push(`${name}:${hit.line} ${hit.kind}: ${hit.value}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })
})
