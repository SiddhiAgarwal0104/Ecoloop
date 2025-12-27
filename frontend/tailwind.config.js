/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f4faf6',
          100: '#e8f5e9',
          200: '#c8e6c9',
          300: '#a5d6a7',
          400: '#81c784',
          500: '#66bb6a',
          600: '#4caf50',
          700: '#2e7d32',
          800: '#1b5e20',
          900: '#104d15',
        },
        eco: {
          light: '#f4faf6',
          main: '#2e7d32',
          dark: '#1b5e20',
          border: '#c8e6c9',
        }
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}