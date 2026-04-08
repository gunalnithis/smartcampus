/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Space Grotesk"', 'sans-serif'],
        serif: ['"DM Serif Display"', 'serif'],
      },
      colors: {
        hub: {
          ink: '#0f172a',
          steel: '#334155',
          cloud: '#e2e8f0',
          mist: '#f8fafc',
          aqua: '#14b8a6',
          ocean: '#0ea5e9',
          ember: '#f97316',
          moss: '#16a34a',
          ruby: '#dc2626',
        },
      },
      boxShadow: {
        panel: '0 12px 36px rgba(15, 23, 42, 0.14)',
      },
    },
  },
  plugins: [],
}
