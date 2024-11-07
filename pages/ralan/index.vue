<template>
  <UCard>
    <!-- Header -->
    <template #header>
      <div class="flex items-start gap-4">
        <UButton icon="i-healthicons-walking" variant="soft" color="sky" square />
        <div>
          <h3 class="text-lg text-sky-600 dark:text-sky-400 font-semibold">Pasien Rawat jalan</h3>
          <p class="text-sm text-cool-500">Daftar pasien rawat jalan berdasarkan nomor sep</p>
        </div>
      </div>
    </template>

    <!-- Filter and search -->
    <div class="mb-4 flex flex-col lg:flex-row gap-4 justify-end items-center">
      <!-- tanggal masuk - keluar -->
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton icon="i-tabler-calendar-event" variant="soft" color="sky">
          <span v-if="typeof date === 'object' && date.start && date.end">
            {{ format(date.start, 'd MMM, yyy') }} - {{ format(date.end, 'd MMM, yyy') }}
          </span>

          <span v-else>Tanggal Registrasi</span>
        </UButton>

        <template #panel="{ close }">
          <DatePicker v-model="(date as any)" @close="close" isRange />

          <div class="flex justify-end p-3">
            <UButton color="red" @click="clearDate" icon="i-tabler-circle-x">Clear</UButton>
          </div>
        </template>
      </UPopover>

      <!-- search -->
      <UInput placeholder="Search..." class="w-full md:w-[50%] lg:w-[20%]" v-model="qw" />
    </div>

    <!-- Table -->
    <TablePasienRalan :data="(data as any)" :error="(error as any)" :refresh="refresh" :status="status" :costStatus="costStatus.value" :realCostData="realCost" :grouppingCostData="grouppingCost" />

    <!-- pagination -->
    <div v-if="data && (data as any).meta">
      <div class="mt-5 flex flex-col md:flex-row items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Showing : {{ ((data as any).meta as any).from }}
          to {{ ((data as any).meta as any).to }}
          of {{ ((data as any).meta as any).total }} entries
        </p>

        <UPagination v-model="currentPage" :page-count="((data as any).meta as any).per_page"
          :total="((data as any).meta as any).total" />
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import { format } from 'date-fns'
import { useClipboard, useDebounceFn } from '@vueuse/core'

const config = useRuntimeConfig()
const token = useAccessTokenStore()
const toast = useToast()

const qw = ref<string>('')
const currentPage = ref(1)
const realCost = ref([]);
const grouppingCost = ref([]);
const costStatus = reactive({ value: 'idle' });

const date = ref<{
  start: Date | undefined,
  end: Date | undefined
}>({
  start: new Date(),
  end: new Date()
})

interface Filter {
  field: string;
  operator: string;
  value: string | Date | undefined;
}

const bodyReqs = ref<any>({
  filters: [
    { field: 'jnspelayanan', operator: '=', value: '2' },
    { field: 'reg_periksa.tgl_registrasi', operator: '>=', value: date.value.start ? format(date.value.start, 'yyyy-MM-dd') : undefined },
    { field: 'reg_periksa.tgl_registrasi', operator: '<=', value: date.value.end ? format(date.value.end, 'yyyy-MM-dd') : undefined }
  ],
  sort: [{ field: 'no_rawat', direction: 'desc' }],
  search: { value: '' },
  includes: [
    { "relation": "pasien" },
    { "relation": "status_klaim" },
    { "relation": "berkasPerawatan" },
    { "relation": "reg_periksa.dokter.spesialis" },
  ]
})

const { data, error, refresh, status } = await useAsyncData(
  'sep/search',
  () => $fetch(`${config.public.API_V2_URL}/sep/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      Accept: 'application/json',
      ContentType: 'application/json'
    },
    body: JSON.stringify(bodyReqs.value),
    query: { page: currentPage.value }
  }),
  { immediate: true, watch: [currentPage, bodyReqs.value] }
);

if (error.value) {
  toast.add({
    icon: 'i-tabler-circle-x',
    title: 'Error!',
    description: error.value.message,
    color: 'red',
    timeout: 2000
  })
}

const clearDate = () => {
  date.value.start = date.value.end = undefined
  bodyReqs.value.filters = bodyReqs.value.filters.filter((f: Filter) => f.field !== 'reg_periksa.tgl_registrasi')
}

watch(date, () => {
  bodyReqs.value.filters = bodyReqs.value.filters.filter((f: Filter) => f.field !== 'reg_periksa.tgl_registrasi')

  bodyReqs.value.filters = [
    ...bodyReqs.value.filters,
    { field: 'reg_periksa.tgl_registrasi', operator: '>=', value: date.value.start ? format(date.value.start, 'yyyy-MM-dd') : undefined },
    { field: 'reg_periksa.tgl_registrasi', operator: '<=', value: date.value.end ? format(date.value.end, 'yyyy-MM-dd') : undefined }
  ]

  console.log(bodyReqs.value.filters);
})

watch(qw, useDebounceFn((value) => {
  bodyReqs.value.filters = bodyReqs.value.filters.filter((f: Filter) => f.field === 'jnspelayanan')
  bodyReqs.value.search = { value: value ?? '' }
}, 1500))

watch(status, async () => {
  if (status.value == 'success') {
    await fetchRealCost()
  }
})

onMounted(async () => {
  if (status.value == 'success') {
    await fetchRealCost()
  }
})

async function fetchRealCost() {
  costStatus.value = 'loading';

  try {
    let showedNoRawat = (data.value as any).data.map((d: any) => d.no_rawat);
    let showedNoSep = (data.value as any).data.map((d: any) => d.no_sep);

    const [realCostResponse, grouppingCostResponse] = await Promise.all([
      $fetch(`${config.public.API_V2_URL}/pasien/ranap/real-cost`, {
        method: 'POST',
        body: { filters: [{ field: 'no_rawat', operator: 'in', value: showedNoRawat }] },
        headers: { Authorization: `Bearer ${token.accessToken}` }
      }) as any,

      $fetch(`${config.public.API_V2_URL}/pasien/ranap/grouping-cost`, {
        method: 'POST',
        body: { filters: [{ field: 'no_sep', operator: 'in', value: showedNoSep }] },
        headers: { Authorization: `Bearer ${token.accessToken}` }
      }) as any
    ]);

    // sleep 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if response contains an error
    if (!realCostResponse || !realCostResponse.data) {
      costStatus.value = 'error';
      throw new Error("Invalid response from server");
    }

    if (!grouppingCostResponse || !grouppingCostResponse.data) {
      costStatus.value = 'error';
      throw new Error("Invalid response from server");
    }

    realCost.value = realCostResponse.data;
    grouppingCost.value = grouppingCostResponse.data;
  } catch (error) {
    console.error("Error fetching real cost:", error);
    costStatus.value = 'error';
  } finally {
    costStatus.value = 'success';
  }
}

</script>