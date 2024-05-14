<script setup lang="ts">
const route = useRoute()
const links = [[
    {
        "label": "Dashboard",
        "icon": "i-tabler-layout-dashboard",
        "to": "/"
    }
], [
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
]];
</script>

<template>
  <div class="flex bg-cool-800 text-cool-100">
    <!-- sidebar -->
    <div class="flex-none w-60 h-screen relative">
      <div class="h-full border-r border-cool-800 bg-cool-900">
        <!-- logo -->
        <div class="flex items-center justify-start p-4 px-7 h-14 border-b border-cool-800">
          <span class="text-lg font-bold tracking-widest font-mono"><span class="text-primary">I</span>CC</span>
        </div>

        <!-- links -->
        <div class="p-4 overflow-y-auto max-h-[calc(100vh-3.5rem)] shadow">
          <UVerticalNavigation :links="links" />
        </div>
      </div>

      <!-- footer -->
      <div class="absolute bottom-0 w-full p-4 border-t border-cool-800 bg-cool-900">
        <p class="text-xs text-center">
          © 2024 <ULink 
            to="https://github.com/halimkun/filetrack/" 
            target="_blank"
            active-class="font-semibold text-primary"
            inactive-class="font-semibold text-primary"
          >INA-CBG's Cost Compare</ULink>
        </p>
      </div>
    </div>
    <!-- end sidebar -->

    <!-- main content -->
    <div class="flex-1 h-full max-h-screen overflow-y-auto">
      <div class="p-4">
        <slot />
      </div>
    </div>
  </div>
</template>