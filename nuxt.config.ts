// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  
  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
    "@vueform/nuxt"
  ],

  build: {
    transpile: ['pinia-plugin-persistedstate'],
  },


  css: [
    '~/assets/style/custom.css',
  ],
})