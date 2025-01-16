<script setup lang="ts">
const route = useRoute()
const links = [
  [],
  [
    {
      "label": "Dashboard",
      "icon": "i-tabler-layout-dashboard",
      "to": "/"
    },
    { "label": "Rawat Inap", "icon": "i-tabler-bed", "to": "/ranap" },
    { "label": "Rawat Jalan", "icon": "i-tabler-walk", "to": "/ralan" },
    { "label": "Grade III", "icon": "i-tabler-alert-triangle", "to": "/grade-3" }
  ],
  [
    { "label": "Logout", "icon": "i-tabler-logout", "to": "/auth/logout" },
  ],
];
</script>

<template>
  <!-- main -->
  <div class="w-full bg-cool-100 text-cool-800 dark:bg-cool-800 dark:text-cool-100 min-h-screen">

    <UHorizontalNavigation :links="links" class="bg-white border-b border-cool-200 dark:bg-cool-800 dark:border-cool-700 shadow sticky top-0 z-[1] px-4" />

    <div class="p-4 pb-8">
      <slot />
    </div>

  </div>
</template>