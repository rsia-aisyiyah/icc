import { FirebaseApp } from 'firebase/app'
import { Analytics } from 'firebase/analytics'

declare module '#app' {
  interface NuxtApp {
    $firebase: {
      firebaseApp: FirebaseApp,
      analytics: Analytics,
      logEvent: (analytics: Analytics, eventName: string, eventParams?: { [key: string]: any }) => void
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $firebase: {
      firebaseApp: FirebaseApp,
      analytics: Analytics,
      logEvent: (analytics: Analytics, eventName: string, eventParams?: { [key: string]: any }) => void
    }
  }
}
