module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#030304"
      },
      fontFamily: {
        barlow: ['Barlow Semi Condensed', 'sans-serif'],
        fjalla: ['Fjalla One', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        merriweather: ['Merriweather', 'serif'],
      }
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography")
  ],
}
