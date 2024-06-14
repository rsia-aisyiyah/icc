import { defineNuxtPlugin } from '#app'
import { getAnalytics } from 'firebase/analytics'
import { initializeApp } from 'firebase/app'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const firebaseApp = initializeApp({
    apiKey: config.public.firebase.apiKey,
    authDomain: config.public.firebase.authDomain,
    projectId: config.public.firebase.projectId,
    storageBucket: config.public.firebase.storageBucket,
    messagingSenderId: config.public.firebase.messagingSenderId,
    appId: config.public.firebase.appId,
    measurementId: config.public.firebase.measurementId,
  })

  const analytics = getAnalytics(firebaseApp)

  nuxtApp.provide('firebase', {
    firebaseApp,
    analytics,
  })

  // return {
  //   provide: {
  //     firebaseApp,
  //     analytics,
  //   },
  // }
})