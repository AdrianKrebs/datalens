const { fontFamily } = require('tailwindcss/defaultTheme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './components/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', ...fontFamily.sans],
        serif: ['var(--font-dm)', ...fontFamily.serif],
      },
      colors: {
        aubergine: '#220660',
        magnolia: '#FCFAFF',
        sunflower: '#FFD712',
        electra: '#5E17EB',
        current: 'currentColor',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
