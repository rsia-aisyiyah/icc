<script lang="ts" setup>
const props = defineProps<{
  label: string,
  modelValue?: string | { id: string; label: string; icon: string; color: string; variant: string }
}>()

const emit = defineEmits(['update:modelValue'])

const statusTerkirim = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <div class="flex gap-0.5 flex-col">
    <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">{{ label }}</div>
    <div class="p-1.5 px-3 rounded-2xl border border-cool-200 dark:border-cool-700 flex gap-4">
      <URadio v-for="method of [
        { value: '', label: 'Semua' },
        { value: 'terkirim', label: 'Terkirim' },
        { value: 'belum', label: 'Belum' }
      ]" :key="method.value" v-model="statusTerkirim" v-bind="method" />
    </div>
  </div>
</template>
