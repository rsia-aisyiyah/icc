// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: true,
  
  devtools: { enabled: true },

  modules: [
    "@nuxt/ui",
    "@pinia/nuxt",
    "@pinia-plugin-persistedstate/nuxt",
  ],

  plugins: [
    '~/plugins/v-maska.ts',
  ],

  build: {
    transpile: ['pinia-plugin-persistedstate'],
  },

  runtimeConfig: {    
    public: {
      TZ: process.env.NUXT_PUBLIC_TZ,
      API_URL: process.env.NUXT_PUBLIC_API_BASE_URL,
      API_V2_URL: process.env.NUXT_PUBLIC_API_V2_URL,

      firebase: {
        apiKey: process.env.NUXT_FIREBASE_API_KEY,
        authDomain: process.env.NUXT_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NUXT_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NUXT_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NUXT_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NUXT_FIREBASE_APP_ID,
        measurementId: process.env.NUXT_FIREBASE_MEASUREMENT_ID
      },
    }
  },

  pinia: {
    storesDirs: ['./stores/**'],
  },

  css: [
    '~/assets/style/custom.css',
  ],

  compatibilityDate: "2024-08-13",

  ui: {
    safelistColors: ['orange', 'red', 'green', 'blue', 'yellow', 'purple', 'pink', 'indigo', 'teal', 'cyan', 'gray', 'black', 'white'],
  }
})