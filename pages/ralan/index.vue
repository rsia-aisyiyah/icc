<template>
  <UCard>
    <!-- Header -->
    <template #header>
      <div class="flex items-start gap-4">
        <UButton icon="i-healthicons-inpatient" variant="soft" color="primary" square />
        <div>
          <h3 class="text-lg text-primary font-semibold">Pasien Rawat Inap</h3>
          <p class="text-sm text-cool-500">Daftar pasien rawat inap yang belum pulang</p>
        </div>
      </div>
    </template>

    <!-- Filter and search -->
    <div class="mb-4 flex flex-col lg:flex-row gap-4 justify-end items-center">
      <!-- tanggal masuk - keluar -->
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton icon="i-tabler-calendar-event">
          <span v-if="typeof date === 'object' && date.start && date.end">
            {{ format(date.start, 'd MMM, yyy') }} - {{ format(date.end, 'd MMM, yyy') }}
          </span>
          
          <span v-else>Tanggal Registrasi</span>
        </UButton>

        <template #panel="{ close }">
          <DatePicker v-model="(date as DatePickerRangeObject )" @close="close" isRange />
        </template>
      </UPopover>

      <!-- search -->
      <UInput v-model="bodyReqs.search.value" placeholder="Search..." class="w-full md:w-[50%] lg:w-[20%]" />
    </div>


    <TablePasienRalan :data="data" :error="error" :refresh="refresh" :status="status" />
  </UCard>
</template>

<script lang="ts" setup>
import { format } from 'date-fns'
import type { DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker.js';

const config = useRuntimeConfig()
const token = useAccessTokenStore()
const toast = useToast()

const date = ref<{
  start: Date | undefined,
  end: Date | undefined
}>({
  start: undefined,
  end: undefined
})

const bodyReqs = ref({
  filters: [
    { field: 'jnspelayanan', operator: '=', value: '2' },
  ],
  sort: [{ field: 'no_rawat', direction: 'desc' }],
  // aggregates: [{ type: "sum", relation: "lamaInap", field: "lama" }],
  search: { value: '' },
  includes: [
    { "relation": "pasien" },
    { "relation": "reg_periksa" },
  ]
})

const { data, error, refresh, status } = await useFetch(`${config.public.API_V2_URL}/sep/search`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token.accessToken}`,
    Accept: 'application/json',
    ContentType: 'application/json'
  },
  body: JSON.stringify(bodyReqs.value)
})

if (error.value) {
  toast.add({
    icon: 'i-tabler-circle-x',
    title: 'Error!',
    description: error.value.data.message,
    color: 'red',
    timeout: 2000
  })
}

</script>