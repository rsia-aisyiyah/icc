<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'nuxt/app'
import { z } from 'zod'

const config = useRuntimeConfig()

// Define Zod schema for form validation
const schema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' })
})

// Reactive form state
const formData = ref({
  username: '',
  password: ''
})

// Validation errors
const errors = ref<{ [key: string]: string | null }>({
  username: null,
  password: null
})

onMounted(() => {
  formData.value.username = config.public.TEST_USERNAME || ''
  formData.value.password = config.public.TEST_PASSWORD || ''
})

const validateForm = () => {
  const result = schema.safeParse(formData.value)
  if (result.success) {
    errors.value = { username: null, password: null }
    return true
  } else {
    result.error.errors.forEach(error => {
      errors.value[error.path[0]] = error.message
    })
    return false
  }
}

const handleSubmit = async () => {
  const toast = useToast()
  const router = useRouter()
  const tokenStore = useAccessTokenStore()

  if (!validateForm()) return

  try {
    const response = await fetch(`${config.public.API_V2_URL}/user/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })
    const data = await response.json()

    if (response.status === 200) {
      tokenStore.set(data.access_token)
      router.push('/')
    } else {
      toast.add({
        title: 'Login failed',
        description: data.message,
        icon: 'i-tabler-alert-triangle',
        color: 'red'
      })
    }
  } catch (error) {
    toast.add({
      title: 'Login failed',
      description: 'An error occurred during login.',
      icon: 'i-tabler-alert-triangle',
      color: 'red'
    })
  }
}
</script>

<template>
  <div class="rounded-md">
    <div class="flex flex-col items-start justify-start gap-5">
      <div class="flex items-start justify-start w-full">
        <img src="/public/static/logo.png" alt="Logo" class="h-20" />
      </div>
      
      <div class="text-left w-full">
        <h2 class="text-2xl font-bold mb-1">Login Petugas</h2>
        <p class="text-gray-600 dark:text-gray-400 leading-5 mb-6">Login untuk dapat menggunakan aplikasi <span class="text-indigo-800 font-bold">ICC (INACBG's Cost Comparator),</span>.</p>
      </div>
    </div>

    <hr class="mb-6 dark:border-gray-700 border-gray-400" />

    <div class="space-y-4 mb-10">
      <!-- Username Field -->
      <UFormGroup label="Username (NIK)" 
        v-model="formData.username" 
        v-slot="{ error }"
        :ui="{label: { base: 'block font-medium font-bold text-indigo-800' }}"
        :error="!formData.username && 'Username is required'"
      >
        <UInput id="username" 
          v-model="formData.username" 
          placeholder="username (nik)" 
          autocomplete="off" 
          size="lg"
          icon="i-tabler-user" 
          :trailing-icon="error ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
          :ui="{color: {
            white: {
              outline: 'shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-{color}-500 dark:focus:ring-{color}-400'
            },
            gray: {
              outline: 'shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-{color}-500 dark:focus:ring-{color}-400'
            }
          },}"
          required 
        />
      </UFormGroup>

      <!-- Password Field -->
      <UFormGroup label="Password" 
        v-model="formData.password" 
        v-slot="{ error }"
        :ui="{label: { base: 'block font-medium font-bold text-indigo-800' }}"
        :error="!formData.password && 'Password is required'"
      >

        <UInput id="password" 
          v-model="formData.password" 
          placeholder="password" 
          autocomplete="off" 
          size="lg"
          type="password" icon="i-tabler-lock"
          :trailing-icon="error ? 'i-heroicons-exclamation-triangle-20-solid' : undefined" 
          :ui="{color: {
            white: {
              outline: 'shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-{color}-500 dark:focus:ring-{color}-400'
            },
            gray: {
              outline: 'shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-{color}-500 dark:focus:ring-{color}-400'
            }
          },}"
          required 
        />
      </UFormGroup>
    </div>

    <!-- Submit Button -->
    <button @click.prevent="handleSubmit" type="button"
      class="btn btn-indigo w-full py-2 mt-2 text-lg font-semibold rounded-md bg-indigo-800 hover:bg-indigo-700 text-white dark:bg-indigo-700 dark:hover:bg-indigo-800">
      Login
    </button>
  </div>
</template>

<style scoped>
.login-form {
  max-width: 8px;
  margin: auto;
}
</style>
