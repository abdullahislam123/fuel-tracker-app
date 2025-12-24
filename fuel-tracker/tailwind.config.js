/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // ⭐ Sirf yahan hona chahiye (Root level par)
  theme: {
    extend: {}, // Dark mode settings theme ke andar nahi aati
  },
  plugins: [],
}