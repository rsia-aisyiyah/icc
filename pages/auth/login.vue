<template>
  <ClientOnly>
    <div class="p-10 bg-cool-900 rounded-xl w-[90%] md:w-[60%] lg:w-[50%] xl:w-[40%] 2xl:w-[30%]">
      <FormLogin />
    </div>
  </ClientOnly>
</template>

<script lang="ts" setup>
definePageMeta({
  title: 'Login',
  layout: 'auth'
})
</script>