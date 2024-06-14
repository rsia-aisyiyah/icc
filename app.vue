<template>
  <NuxtLoadingIndicator />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <UNotifications />
</template>

<script lang="ts" setup>
import { logEvent } from '~/utils/firebase'

import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'

const router = useRouter()
const nuxtApp = useNuxtApp()

router.afterEach((to, from) => {
  logEvent('page_view', {
    page_path: to.fullPath,
    page_title: document.title,
  })

  // const { analytics } = nuxtApp.$firebase
  // if (analytics) {
  //   analytics.logEvent('page_view', {
  //     page_path: to.fullPath,
  //     page_title: document.title,
  //   })
  // }
})

</script>