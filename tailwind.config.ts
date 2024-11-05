// tailwind.config.(js|ts)

module.exports = {
  content: [
    './pages/**/*.vue',
    './layouts/**/*.vue',
    './components/**/*.vue',
    './plugins/**/*.ts',
    './utils/**/*.ts',
    './data/**/*.ts',
    './common/**/*.ts',

    "./components/**/*.{vue,js,jsx,mjs,ts,tsx}",
    "./layouts/**/*.{vue,js,jsx,mjs,ts,tsx}",
    "./pages/**/*.{vue,js,jsx,mjs,ts,tsx}",
    "./plugins/**/*.{js,ts,mjs}",
    "./composables/**/*.{js,ts,mjs}",
    "./utils/**/*.{js,ts,mjs}",
    "./{A,a}pp.{vue,js,jsx,mjs,ts,tsx}",
    "./{E,e}rror.{vue,js,jsx,mjs,ts,tsx}",
    "./app.config.{js,ts,mjs}",
    "./app/spa-loading-template.html",


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