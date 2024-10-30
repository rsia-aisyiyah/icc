<template>
  <UModal v-model="localIsOpen" prevent-close>
    <UCard>
      <!-- centered loading animation with some text -->
      <div class="flex flex-col gap-10 items-center justify-center py-10">
        <UIcon name="i-tabler-loader-2" class="animate-spin w-14 h-14 text-primary" />

        <div class="flex flex-col items-center gap-0">
          <span class="leading-5">Sengaja tak buat loading screen.</span>
          <span class="leading-5">sorry ya 🙏</span>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
const props = defineProps({
  isOpen: {
    required: true,
    type: Boolean
  },
})

const localIsOpen = ref(props.isOpen)
const emit = defineEmits(['update:isOpen'])

// Watch changes in localIsOpen and emit updates to parent
watch(localIsOpen, (newValue) => {
  emit('update:isOpen', newValue)
})

// Watch props.isOpen in case the parent updates it directly
watch(() => props.isOpen, (newValue) => {
  localIsOpen.value = newValue
})

</script>