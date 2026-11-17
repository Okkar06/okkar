import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { derivePalette } from './src/theme/palette.js'
import { DEFAULT_THEME } from './src/theme/presets.js'

// index.html cannot read a CSS custom property, so the default browser-chrome
// colour is stamped into <meta name="theme-color"> from the theme engine here
// rather than being written into the HTML by hand.
const themeColorMeta = () => ({
  name: 'theme-color-meta',
  transformIndexHtml: (html) =>
    html.replace('%THEME_COLOR%', derivePalette(DEFAULT_THEME.color, DEFAULT_THEME.mode).themeColor),
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), themeColorMeta()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
    restoreMocks: true,
    // A few workers start reliably even on a slow or synced disk.
    maxWorkers: 3,
  },
})
