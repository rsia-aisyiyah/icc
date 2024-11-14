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
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
} 