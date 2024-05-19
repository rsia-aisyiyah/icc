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

  runtimeConfig: {    
    public: {
      TZ: process.env.NUXT_PUBLIC_TZ,
      API_URL: process.env.NUXT_PUBLIC_API_BASE_URL,
      API_V2_URL: process.env.NUXT_PUBLIC_API_V2_URL,
      TEST_USERNAME: process.env.NUXT_PUBLIC_TEST_USER_USERNAME,
      TEST_PASSWORD: process.env.NUXT_PUBLIC_TEST_USER_PASSWORD,
    }
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  css: [
    '~/assets/style/custom.css',
  ],
})
