/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",],
  theme: {
    extend: {
      colors: {
        dark: '#171717',
        lightDark: '#212121',
        customGray: '#878799',
        lightWhite: '#ECECEC',
      }
    },
  },
  plugins: [],
}

