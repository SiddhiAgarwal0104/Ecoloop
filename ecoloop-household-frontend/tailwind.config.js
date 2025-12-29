/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          main: "#16a34a",   // green-600
          dark: "#15803d",   // green-700
          light: "#dcfce7",  // green-100
        },

        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
        },

        success: {
          500: "#10b981",
          600: "#059669",
        },

        warning: {
          500: "#f59e0b",
          600: "#d97706",
        },

        danger: {
          500: "#ef4444",
          600: "#dc2626",
        },
      },

      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
