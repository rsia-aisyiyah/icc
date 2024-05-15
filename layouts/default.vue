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
    {
      "label": "Rawat Inap",
      "icon": "i-healthicons-inpatient",
      "to": "/ranap"
    },
    {
      "label": "Rawat Jalan",
      "icon": "i-healthicons-outpatient",
      "to": "/ralan"
    }
  ],
  [],
];
</script>

<template>
  <!-- main -->
  <div class="w-full bg-cool-800 text-cool-100">

    <!-- <div class="sticky top-0 z-[1] bg-cool-800 text-cool-100 shadow-lg"> -->
      <UHorizontalNavigation :links="links" />
    <!-- </div> -->

    <div class="p-4 pb-8">
      <slot />
    </div>

  </div>
</template>