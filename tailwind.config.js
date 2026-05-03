/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          500: '#4263eb',
          600: '#3451db',
          700: '#2541c8',
          800: '#1c33a8',
          900: '#152886',
        }
      }
    }
  },
  plugins: [],
}
