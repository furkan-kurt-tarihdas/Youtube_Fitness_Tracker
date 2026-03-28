/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: '#FAF9F6', // Cozy/Off-white
        primary: '#C3B1E1',    // Pastel Purple
        secondary: '#FDFD96',  // Pastel Yellow
        accent: '#A8E6CF',     // Pastel Green
      }
    },
  },
  plugins: [],
}
