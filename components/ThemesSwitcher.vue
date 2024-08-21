<!-- floating -->
<template>
  <div class="fixed bottom-4 left-4 z-50">
    <div class="flex items-center space-x-2">
      <UDropdown :items="items" v-model="selected" mode="hover" class="relative">
        <!-- circle button toggle -->
        <div class="w-10 h-10 flex items-center justify-center rounded-full bg-cool-500 border-[3px] border-cool-400 shadow-lg">
          <UIcon :name="selected.icon" class="text-white text-xl"/>
        </div> 

        <template #item="{ item }">
          <span class="truncate">{{ item.label }}</span>
          <UIcon :name="item.icon" class="flex-shrink-0 h-4 w-4 text-gray-400 dark:text-gray-500 ms-auto" />
        </template>
      </UDropdown>
    </div>
  </div>
</template>

<script lang="ts" setup>
const selected = ref({ label: "System", icon: "i-tabler-device-mobile", value: "system" })

const toggleColorMode = (mode: string) => {
  useColorMode().preference = mode
  selected.value = items[0].find((item) => item.value === mode) || items[0][0]
}

const items = [[
  { label: "Dark", icon: "i-tabler-moon", value: "dark", click: () => toggleColorMode("dark") },
  { label: "Light", icon: "i-tabler-sun", value: "light", click: () => toggleColorMode("light") },
  { label: "System", icon: "i-tabler-device-mobile", value: "system", click: () => toggleColorMode("system") }
]];

</script>