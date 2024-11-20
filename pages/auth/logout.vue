<template>
  <div class="flex items-center justify-center min-h-screen">
    <div class="text-center">
      <div class="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-primary"></div>
      <div class="mt-4 text-gray-700 dark:text-gray-300">
        <span v-if="currentMessage">{{ currentMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'nuxt/app'

definePageMeta({
  title: 'Logout - Please wait...',
  layout: 'auth',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})

const messages = [
  'Logging you out, please wait...',
  'Almost there, please be patient...',
  'Just a moment, we are finishing up...',
  'Thank you for using our services, see you soon!'
]

const currentMessage = ref('')
const currentMessageIndex = ref(0)
const router = useRouter()

const logout = async () => {
  const config = useRuntimeConfig()
  const tokenStore = useAccessTokenStore()

  try {
    await $fetch(`${config.public.API_V2_URL}/user/auth/logout`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenStore.accessToken}`
      }
    })
    router.push('/auth/login')
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

const rotateMessages = () => {
  currentMessage.value = messages[currentMessageIndex.value]
  currentMessageIndex.value = (currentMessageIndex.value + 1) % messages.length
}

onMounted(() => {
  const interval = setInterval(rotateMessages, 2000)
  setTimeout(() => {
    clearInterval(interval)
    logout()
  }, messages.length * 2000)
})
</script>

<style scoped>
.spinner-border {
  border-top-color: transparent;
  border-right-color: transparent;
  border-bottom-color: transparent;
  border-left-color: currentColor;
}
</style>
