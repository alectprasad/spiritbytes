// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        'olive-green': '#6d6941',
        'earth-brown': '#8d6c45',
        'terracotta': '#ae7e5c',
        'sand-beige': '#c19e75',
        'sage-moss': '#807b54',
        'forest-green': '#38523d',
      },
    },
  },
  plugins: [],
  presets: [require("nativewind/preset")],
}