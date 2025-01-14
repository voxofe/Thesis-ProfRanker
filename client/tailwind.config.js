module.exports = {
  purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {

      colors: {
        patras: {
          albescentWhite: '#f2e0c6',
          whiskey: '#d2a368',
          sanguineBrown: '#833234',
          muddyWaters: '#bc8757',
          cameo: '#dbbb9d',
          santaFe: '#ae6c4a',
          buccaneer: '#633439',
          capePalliser: '#9b6447',
          goldSand: '#e4c48c',
          auChico: '#a4605c',
        }
      },
    },
    fontFamily: {
      'custom': ['ZonaPro', 'sans-serif'],
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}