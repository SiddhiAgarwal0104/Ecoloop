/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // EcoLoop Primary Colors (Green Eco Theme)
        'eco-main': '#2e7d32',
        'eco-dark': '#1b5e20',
        'eco-light': '#f4faf6',
        'eco-border': '#c8e6c9',
        
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
        
        // Secondary colors
        blue: {
          50: '#e3f2fd',
          500: '#2196f3',
          600: '#1976d2',
          700: '#1565c0',
        },
        
        yellow: {
          50: '#fff8e1',
          400: '#ffee58',
          500: '#ffc107',
          600: '#ffa000',
        },
        
        red: {
          50: '#ffebee',
          100: '#ffcdd2',
          500: '#f44336',
          600: '#e53935',
        },
        
        orange: {
          50: '#fff3e0',
          500: '#ff9800',
          600: '#fb8c00',
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Roboto', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}