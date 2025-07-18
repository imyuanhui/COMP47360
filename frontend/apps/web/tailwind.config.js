/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // covers all your pages/components
  ],
  theme: {
    extend: {
      animation: {
        fadeIn: "fadeIn 0.8s ease-in-out",
        slideInUp: "slideInUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        slideInUp: {
          "0%": { transform: "translateY(30px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      colors: {
        customPink: "#cc397c",     // replaces text-purple-600
        customAmber: "#e6a73c",    // replaces text-amber-500
        customTeal: "#6590f6",     // replaces text-teal-600
      },
    },
  },
  plugins: [require('@tailwindcss/aspect-ratio')],
};
