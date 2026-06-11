/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", 'system-ui', 'sans-serif'],
        sans: ["'Inter'", 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        bg: '#0f0f0f',
        card: '#171717',
        accent: 'rgb(var(--accent) / <alpha-value>)',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 18s linear infinite',
      },
    },
  },
  plugins: [],
}
