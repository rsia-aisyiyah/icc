<template>
  <div class="p-10 bg-cool-100 text-cool-800 dark:bg-cool-900 dark:text-cool-100 rounded-xl w-[90%] md:w-[60%] lg:w-[50%] xl:w-[40%] 2xl:w-[30%] shadow-md">
    <ClientOnly >
      <FormLogin />
    </ClientOnly>
  </div>
</template>

<script lang="ts" setup>
definePageMeta({
  title: 'Login - Please sign in',
  layout: 'auth',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ]
})
</script>