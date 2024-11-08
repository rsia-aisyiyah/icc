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

const router = useRouter()

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

// TODO : add shortcut for entering klaim forms using sep
// TODO : GET CPPT

</script>