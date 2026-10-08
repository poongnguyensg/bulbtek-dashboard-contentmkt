/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bulbtek: {
          red: '#AF2024',
          'red-hover': '#C9282C',
          'red-dark': '#831417',
          'red-light': '#FEE2E2',
          dark: 'rgb(var(--bg-header) / <alpha-value>)',
          'dark-deep': 'rgb(var(--bg-main) / <alpha-value>)',
          'dark-surface': 'rgb(var(--bg-card) / <alpha-value>)',
          'dark-border': 'rgb(var(--border-color) / <alpha-value>)',
          'dark-muted': 'rgb(var(--bg-muted) / <alpha-value>)',
          gold: '#F5A623',
        }
      },
      boxShadow: {
        'glow-red': '0 0 20px -5px rgba(175, 32, 36, 0.45)',
        'glow-red-lg': '0 0 35px -5px rgba(175, 32, 36, 0.65)',
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.45)',
        'card-light': '0 4px 14px 0 rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
