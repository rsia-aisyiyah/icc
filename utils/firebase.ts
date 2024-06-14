import { useNuxtApp } from '#app'
import { logEvent as firebaseLogEvent } from 'firebase/analytics'

export const logEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
  const nuxtApp = useNuxtApp()
  const { analytics } = nuxtApp.$firebase

  if (analytics) {
    firebaseLogEvent(analytics, eventName, eventParams)
  } else {
    console.error('Firebase Analytics is not initialized')
  }
}
