import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'

interface PublicFirebaseConfig {
  apiKey: string
  authDomain: string
  projectId: string
  storageBucket: string
  messagingSenderId: string
  appId: string
  measurementId: string
}

export default defineNuxtPlugin(async (nuxtApp) => {
  const config = useRuntimeConfig()
  const firebaseConfig = config.public.firebase as PublicFirebaseConfig

  const globalKey = '__FIREBASE_CLIENT_APP__'

  let firebaseApp

  if (!getApps().length) {
    if (!globalThis[globalKey]) {
      globalThis[globalKey] = initializeApp({
        apiKey: firebaseConfig.apiKey,
        authDomain: firebaseConfig.authDomain,
        projectId: firebaseConfig.projectId,
        storageBucket: firebaseConfig.storageBucket,
        messagingSenderId: firebaseConfig.messagingSenderId,
        appId: firebaseConfig.appId,
        measurementId: firebaseConfig.measurementId,
      })
    }
    firebaseApp = globalThis[globalKey]
  } else {
    firebaseApp = getApps()[0]
  }

  let analytics = null

  if (await isSupported()) {
    analytics = getAnalytics(firebaseApp)
  }

  nuxtApp.provide('firebase', {
    firebaseApp,
    analytics,
  })
})