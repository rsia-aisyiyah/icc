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
      router.push('/ranap')
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
    <h2 class="text-2xl font-semibold mb-1">Login Pegawai</h2>
    <p class="text-gray-600 dark:text-gray-400 mb-6">Login untuk dapat menggunakan aplikasi <span class="text-purple-400 font-semibold">ICC (INACBG's Cost Comparator)</span>.</p>
    <hr class="mb-6 dark:border-gray-700" />

    <div class="space-y-4 mb-10">
      <!-- Username Field -->
      <UFormGroup label="Username (NIK)" v-model="formData.username" v-slot="{ error }" :error="!formData.username && 'Username is required'">
        <UInput
          id="username"
          v-model="formData.username"
          placeholder="username (nik)"
          autocomplete="off"
          size="lg"
          icon="i-tabler-user"
          :trailing-icon="error ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
          required
        />
      </UFormGroup>

      <!-- Password Field -->
      <UFormGroup label="Password" v-model="formData.password" v-slot="{ error }" :error="!formData.password && 'Password is required'">
        <UInput
          id="password"
          v-model="formData.password"
          placeholder="password"
          autocomplete="off"
          size="lg"
          type="password"
          icon="i-tabler-lock"
          :trailing-icon="error ? 'i-heroicons-exclamation-triangle-20-solid' : undefined"
          required
        />
      </UFormGroup>
    </div>

    <!-- Submit Button -->
    <button
      @click.prevent="handleSubmit"
      type="button"
      class="btn btn-purple w-full py-2 mt-2 text-lg font-semibold rounded-md bg-purple-500 hover:bg-purple-600 text-white dark:bg-purple-700 dark:hover:bg-purple-800"
    >
      Login
    </button>
  </div>
</template>

<style scoped>
.login-form {
  max-width: 400px;
  margin: auto;
}
</style>
