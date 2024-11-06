<template>
  <UModal v-model="localIsOpen" prevent-close :ui="{ width: 'w-full sm:max-w-3xl', }">
    <UForm :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <UCard :ui="{ ring: '', divide: 'divide-y divide-gray-100 dark:divide-gray-800' }">
        <template #header>
          <div class="flex items-center justify-between">
            <h3
              class="text-base font-semibold leading-6 text-gray-900 dark:text-white inline-flex items-center justify-center gap-3">
              <UIcon name="i-tabler-edit" class="w-6 h-6" />
              Klaim Status & Feedback
            </h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
              @click="localIsOpen = false" />
          </div>
        </template>

        <div class="flex flec-col lg:flex-row items-start justify-between gap-3">
          <div class="w-full">
            <UFormGroup label="Log Perubahan">
              <div class="rounded-lg max-h-[340px] overflow-y-auto pr-1">
                <!-- loop logs data -->
                <div v-for="log in (logs as any)?.data ?? []" :key="log?.id"
                  class="w-full bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg mb-2 hover:bg-indigo-200 dark:hover:bg-gray-700">
                  <div>
                    <div class="flex gap-2 items-center">
                      <div class="flex items-center justify-between gap-2 w-full">
                        <!-- status -->
                        <div class="flex items-center gap-2">
                          <UIcon :name="status.find((s) => s.id == log?.status)?.icon as string" class="w-5 h-5" />
                          <span class="text-sm font-semibold">{{ log?.status }}</span>
                        </div>

                        <!-- tanggal -->
                        <div class="flex flex-col gap-1">
                          <strong class="text-xs leading-none">{{ new Date(log?.updated_at).toLocaleDateString('id-ID',
                            { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'}) }}</strong>
                          <div class="text-xs text-gray-500">{{ new Date(log?.updated_at).toLocaleTimeString('id-ID') }}
                            WIB
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- feedback -->
                  <div v-if="log?.feedback?.catatan"
                    class="mt-2 w-full px-3 py-1 bg-lime-200/50 dark:bg-lime-800/30 rounded-lg border-2 border-lime-200 dark:border-lime-800 text-lime-800 dark:text-lime-200">
                    <strong class="text-sm font-semibold">Feedback</strong>
                    <div class="text-sm">{{ log?.feedback?.catatan }}</div>
                  </div>

                  <!-- petugas -->
                  <div v-if="log?.petugas" class="mt-3 w-full">
                    <div class="text-sm">{{ log?.petugas?.nama }}</div>
                  </div>
                </div>
              </div>
            </UFormGroup>
          </div>

          <div class="flex flex-col gap-3 w-full">
            <!-- Text Area -->
            <UFormGroup label="Feedback" name="feedback">
              <UTextarea v-model="state.feedback" resize :rows="10" label="Feedback" placeholder="Masukkan feedback" />
            </UFormGroup>

            <!-- Select Menu -->
            <UFormGroup label="Status" name="status">
              <USelectMenu v-model="selectedStatus" :options="status" @change="state.status = selectedStatus.id">
                <template #leading>
                  <UIcon v-if="selectedStatus.icon" :name="(selectedStatus.icon as string)" class="w-5 h-5" />
                </template>
              </USelectMenu>
            </UFormGroup>

            <!-- Button Submit -->
            <div class="flex justify-end gap-2 mt-4">
              <UButton color="green" icon="i-tabler-check" type="submit" :loading="loadButton" :disabled="loadButton">
                Simpan
              </UButton>
              <UButton color="gray" variant="ghost" @click="localIsOpen = false">Batal</UButton>
            </div>
          </div>
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
const feedback = ref('')

interface Log {
  id?: string;
  updated_at?: string;
  petugas?: {
    nik?: string;
    nama?: string
  }
  feedback?: {
    catatan?: string;
  },
}

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
  },
  callback: {
    required: false,
    type: Function
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
  feedback: z.string()
})

// Extract the schema type
type Schema = z.output<typeof schema>

// Form state
const state = reactive({
  no_sep: '',
  no_rawat: '',
  status: selectedStatus.value.id,
  feedback: feedback.value,
})

// Form submit handler
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loadButton.value = true

  state.no_sep = props.sep
  state.no_rawat = props.noRawat
  state.feedback = state.feedback == '' ? '-' : state.feedback

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
    console.error(error)
    toast.add({
      icon: 'i-tabler-circle-x',
      title: 'Error!',
      description: error.value.data.message,
      color: 'red',
      timeout: 2000
    })
  }

  if (status.value == 'success') {
    refreshLog()
    toast.add({
      icon: 'i-tabler-circle-check',
      title: 'Success!',
      description: 'Status klaim berhasil diubah',
      color: 'sky',
      timeout: 2000
    })
  }

  loadButton.value = false
  localIsOpen.value = false
  if (props.callback) {
    props.callback()
  }
}

const { data: logs, error, refresh: refreshLog } = await useAsyncData(
  `${config.public.API_V2_URL}/sep/${props.sep}/klaim/status`,
  async () => {
    // Only fetch data if props.sep has a value
    if (props.sep) {
      return $fetch(`${config.public.API_V2_URL}/sep/${props.sep}/klaim/logs`, {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: `Bearer ${token.accessToken}`
        },
      });
    }
    return Promise.resolve(null); // or some default empty data if needed
  },
  {
    watch: [() => props.sep, () => localIsOpen.value],
  }
);

</script>
