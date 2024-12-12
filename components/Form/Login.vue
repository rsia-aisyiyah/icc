<script setup lang="ts">
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'


const toast = useToast()
const router = useRouter()
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

// Define Zod schema for form validation
const schema = z.object({
  username: z.string().min(1, { message: 'Username is required' }),
  password: z.string().min(1, { message: 'Password is required' })
})

type Schema = z.output<typeof schema>

// Reactive form state
const state = reactive({
  username: undefined,
  password: undefined
})


async function onSubmit(event: FormSubmitEvent<Schema>) {  
  try {
    const response = await fetch(`${config.public.API_V2_URL}/user/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(state)
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

    <div class="mb-2">
      <UForm :schema="schema" :state="state" @submit="onSubmit">

        <div class="space-y-4">
          <!-- Username Field -->
          <UFormGroup label="Username (NIK)" name="username" :ui="{label: { base: 'block font-medium font-bold text-indigo-800' }}" >
            <UInput v-model="state.username" placeholder="username (nik)" autocomplete="off"  size="lg" icon="i-tabler-user" 
              :ui="{color: {
                white: {
                  outline: 'shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-{color}-500 dark:focus:ring-{color}-400'
                },
                gray: {
                  outline: 'shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-{color}-500 dark:focus:ring-{color}-400'
                }
              }}" 
            />
          </UFormGroup>
    
          <!-- Password Field -->
          <UFormGroup label="Password" name="password" :ui="{label: { base: 'block font-medium font-bold text-indigo-800' }}" >
            <UInput v-model="state.password" placeholder="password" autocomplete="off"  size="lg" type="password" icon="i-tabler-lock"
              :ui="{color: {
                white: {
                  outline: 'shadow-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-{color}-500 dark:focus:ring-{color}-400'
                },
                gray: {
                  outline: 'shadow-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white ring-1 ring-inset ring-gray-300 dark:ring-gray-700 focus:ring-2 focus:ring-{color}-500 dark:focus:ring-{color}-400'
                }
              },}" 
            />
          </UFormGroup>
        </div>

        <!-- Submit Button -->
        <UButton type="submit" block color="indigo" size="lg" class="mt-10">
          Login
        </UButton>
      </UForm>
    </div>

  </div>
</template>