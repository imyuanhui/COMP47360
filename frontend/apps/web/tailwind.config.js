//** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 0.8s ease-in-out",
        slideInUp: "slideInUp 0.4s ease-out", // ✅ NEW
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideInUp: { // ✅ NEW
          '0%': {
            transform: "translateY(30px)",
            opacity: "0",
          },
          '100%': {
            transform: "translateY(0)",
            opacity: "1",
          },
        },
      },
    },
  },
  plugins: [],
};

