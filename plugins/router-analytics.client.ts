import { logEvent } from 'firebase/analytics'
import { useNuxtApp } from '#app'
import { useRouter } from 'vue-router'

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp() // Ambil nuxtApp
  const router = useRouter()

  router.afterEach((to, from) => {
    const firebase = nuxtApp.$firebase // Ambil resource firebase yang disediakan plugin pertama
    let title = '';

    if (document.title) {
      title = document.title;
    } else if (to.name) {
      const paramsString = Object.keys(to.params || {}).length
        ? ` (${Object.entries(to.params).map(([key, value]) => `${key}: ${value}`).join(', ')})`
        : '';

      title = to.name.toString() + paramsString;
    } else {
      title = 'Unknown Page';
    }

    if (firebase?.analytics) {
      logEvent(firebase.analytics, 'page_view', {
        page_title: title,
        page_path: to.fullPath,
        page_location: window.location.href,
      })
    }
  })
})