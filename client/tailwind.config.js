/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#111827',
        card: '#1f2937',
        accent: '#3b82f6',
        accentAlt: '#8b5cf6',
      },
    },
  },
  plugins: [],
}
