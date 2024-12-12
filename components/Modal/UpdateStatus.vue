<template>
  <UModal v-model="localIsOpen" prevent-close>
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white inline-flex items-center justify-center gap-3">
              <UIcon name="i-tabler-edit" class="w-6 h-6" />
              Update Status Klaim {{ sep }} - {{ noRawat }}
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1" @click="localIsOpen = false" />
          </div>
        </template>

        <UFormGroup label="Status" name="status">
          <USelectMenu v-model="selectedStatus" :options="status" @change="state.status = selectedStatus.id">
            <template #leading>
              <UIcon v-if="selectedStatus.icon" :name="(selectedStatus.icon as string)" class="w-5 h-5" />
            </template>
          </USelectMenu>
        </UFormGroup>

        <!-- button submit -->
        <div class="flex justify-end gap-2 mt-4">
          <UButton color="green" icon="i-tabler-check" type="submit" :loading="loadButton" :disabled="loadButton">Simpan</UButton>
          <UButton color="gray" variant="ghost" @click="localIsOpen = false">Batal</UButton>
        </div>
      </UCard>
    </UForm>
  </UModal>
</template>

<script lang="ts" setup>
import { z } from 'zod'
import type { FormSubmitEvent } from '#ui/types'

const loadButton = ref(false)
const config = useRuntimeConfig()
const token = useAccessTokenStore()
const toast = useToast()
const status = [
  { id: "verifikasi resume", label: "verifikasi resume", icon: "i-tabler-checklist", },
  { id: "lengkap", label: "lengkap", icon: "i-tabler-checkbox", },
  { id: "pengajuan", label: "pengajuan", icon: "i-tabler-cube-send", },
  { id: "perbaiki", label: "perbaiki", icon: "i-tabler-hammer", },
  { id: "disetujui", label: "disetujui", icon: "i-tabler-rosette-discount-check", },
  { id: "klaim ambulans", label: "klaim ambulans", icon: "i-tabler-ambulance", },
  { id: "batal", label: "batal", icon: "i-tabler-circle-x", },
  { id: "pending", label: "pending", icon: "i-tabler-refresh" }
];

const selectedStatus = ref(status[0]);

// Props  
const props = defineProps({
  isOpen: {
    required: true,
    type: Boolean
  },
  sep: {
    required: true,
    type: String
  },
  noRawat: {
    required: true,
    type: String
  }
})

// Emits
const emit = defineEmits(['update:isOpen'])

// Local state for v-model
const localIsOpen = ref(props.isOpen)

// Watch changes in localIsOpen and emit updates to parent
watch(localIsOpen, (newValue) => {
  emit('update:isOpen', newValue)
})

// Watch props.isOpen in case the parent updates it directly
watch(() => props.isOpen, (newValue) => {
  localIsOpen.value = newValue
})

// ========== + ========== + ========== + ==========

// Form schema
const schema = z.object({
  status: z.string(),
  no_sep: z.string(),
  no_rawat: z.string(),
})

// Extract the schema type
type Schema = z.output<typeof schema>

// Form state
const state = reactive({
  status: selectedStatus.value.id,
  no_sep: '',
  no_rawat: ''
})

// Form submit handler
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loadButton.value = true
  
  state.no_sep = props.sep
  state.no_rawat = props.noRawat

  const { data, error, status } = await useFetch(`${config.public.API_V2_URL}/sep/${props.sep}/klaim/status`, {
    headers: {
      accept: 'application/json',
      contentType: 'application/json',
      Authorization: `Bearer ${token.accessToken}`
    },
    method: 'POST',
    body: JSON.stringify(state)
  })

  await new Promise((resolve) => setTimeout(resolve, 1500))

  if (error.value) {
    loadButton.value = false
    console.error(error)
    toast.add({
      icon: 'i-tabler-circle-x',
      title: 'Error!',
      description: error.value.data.message,
      color: 'red',
      timeout: 2000
    })
    return
  }  

  if (status.value == 'success') {
    loadButton.value = false
    toast.add({
      icon: 'i-tabler-circle-check',
      title: 'Success!',
      description: 'Status klaim berhasil diubah',
      color: 'sky',
      timeout: 2000
    })

    localIsOpen.value = false
  }
}
</script>
