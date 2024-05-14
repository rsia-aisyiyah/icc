// tailwind.config.(js|ts)

module.exports = {
  content: [
    './pages/**/*.vue',
    './layouts/**/*.vue',
    './components/**/*.vue',


    './vueform.config.ts', // or where `vueform.config.js` is located. Change `.js` to `.ts` if required.
    './node_modules/@vueform/vueform/themes/tailwind/**/*.vue',
    './node_modules/@vueform/vueform/themes/tailwind/**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [
    require('@vueform/vueform/tailwind'),
  ]
} 