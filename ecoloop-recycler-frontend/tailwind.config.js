/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Eco Green Theme
        eco: {
          main: "#2e7d32",      // Primary Green
          dark: "#1b5e20",      // Dark Green
          light: "#f4faf6",     // Light Green Background
          border: "#c8e6c9",    // Light Green Border
        },
        
        // Green Gradient Palette
        green: {
          50: "#f4faf6",
          100: "#e8f5e9",
          200: "#c8e6c9",
          300: "#a5d6a7",
          400: "#81c784",
          500: "#66bb6a",
          600: "#4caf50",
          700: "#2e7d32",
          800: "#1b5e20",
          900: "#104d15",
        },

        // Blue
        blue: {
          50: "#e3f2fd",
          500: "#2196f3",
          600: "#1976d2",
          700: "#1565c0",
        },

        // Yellow
        yellow: {
          50: "#fff8e1",
          400: "#ffee58",
          500: "#ffc107",
          600: "#ffa000",
        },

        // Purple
        purple: {
          50: "#f3e5f5",
          500: "#9c27b0",
          600: "#7b1fa2",
        },

        // Red
        red: {
          50: "#ffebee",
          100: "#ffcdd2",
          500: "#f44336",
          600: "#e53935",
        },

        // Orange
        orange: {
          50: "#fff3e0",
          500: "#ff9800",
          600: "#fb8c00",
        },

        // Grays
        gray: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#eeeeee",
          300: "#e0e0e0",
          400: "#bdbdbd",
          500: "#9e9e9e",
          600: "#757575",
          700: "#616161",
          800: "#424242",
          900: "#212121",
        },

        // Text Colors
        text: {
          primary: "#1f2937",
          secondary: "#6b7280",
          disabled: "#9ca3af",
        },
      },

      fontFamily: {
        sans: ["Segoe UI", "Roboto", "Arial", "sans-serif"],
      },

      fontSize: {
        xs: "0.75rem",      // 12px
        sm: "0.875rem",     // 14px
        base: "1rem",       // 16px
        lg: "1.125rem",     // 18px
        xl: "1.25rem",      // 20px
        "2xl": "1.5rem",    // 24px
        "3xl": "1.875rem",  // 30px
        "4xl": "2.25rem",   // 36px
        "5xl": "3rem",      // 48px
        "6xl": "3.75rem",   // 60px
      },

      spacing: {
        2: "0.5rem",
        4: "1rem",
        6: "1.5rem",
        8: "2rem",
        10: "2.5rem",
        gap: {
          2: "0.5rem",
          4: "1rem",
          6: "1.5rem",
        },
      },

      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        DEFAULT: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
        xl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      },

      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
      },
    },
  },
  plugins: [],
};
