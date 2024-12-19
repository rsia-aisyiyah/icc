<script lang="ts" setup>
import { format } from 'date-fns'
import { useRouter } from 'vue-router'
import { useDebounceFn } from '@vueuse/core'
import { setStatus } from '~/common/helpers/statusHelper';
import type { OrionFilterInterface } from '~/types';

const token = useAccessTokenStore()
const config = useRuntimeConfig()
const router = useRouter()
const toast = useToast()

const currentPage = ref(1)

const qw = ref<any>('')
const statusTerkirim = ref('')

const realCost = ref([]);
const grouppingCost = ref([]);
const selectedStatus = ref(setStatus[0])
const costStatus = reactive({ value: 'idle' });

const q_status = router?.currentRoute?.value?.query?.status as string
const q_month = router?.currentRoute?.value?.query?.month as string
const q_terkirim = router?.currentRoute?.value?.query?.terkirim as string

const date = ref<any>({
  start: new Date(),
  end: new Date()
})

const bodyReqs = ref<any>({
  scopes: [],
  filters: [
    { field: 'jnspelayanan', operator: '=', value: '2' },
    { field: 'reg_periksa.tgl_registrasi', operator: '>=', value: date.value.start ? format(date.value.start, 'yyyy-MM-dd') : undefined },
    { field: 'reg_periksa.tgl_registrasi', operator: '<=', value: date.value.end ? format(date.value.end, 'yyyy-MM-dd') : undefined }
  ],
  sort: [
    { field: 'reg_periksa.tgl_registrasi', direction: 'asc' },
    { field: 'reg_periksa.jam_reg', direction: 'asc' },
  ],
  search: { value: '' },
  includes: [
    { "relation": "pasien" },
    { "relation": "status_klaim" },
    { "relation": "terkirim_online" },
    { "relation": "berkasPerawatan" },
    { "relation": "reg_periksa.dokter.spesialis" },
    { "relation": "reg_periksa.poliklinik" },
  ]
})

if (q_status) {
  bodyReqs.value.filters = [
    ...bodyReqs.value.filters,
    { field: 'status_klaim.status', operator: '=', value: q_status }
  ]
}

if (q_terkirim) {
  statusTerkirim.value = 'terkirim'
  if (!bodyReqs.value.scopes.some((s: any) => s.name === 'hasBerkasPerawatan')) {
    bodyReqs.value.scopes.push({ name: 'hasBerkasPerawatan' })
  }
}


if (q_month) {
  const [year, month] = q_month.split('-').map(Number)

  date.value.start = new Date(year, month - 1, 1)
  date.value.end = new Date(year, month, 0)

  if (date.value?.start.toString() != 'Invalid Date' && date.value?.end.toString() != 'Invalid Date') {
    bodyReqs.value.filters = bodyReqs.value.filters.filter((f: OrionFilterInterface) => f.field !== 'reg_periksa.tgl_registrasi')
    bodyReqs.value.filters = [
      ...bodyReqs.value.filters,
      { field: 'reg_periksa.tgl_registrasi', operator: '>=', value: format(date.value.start, 'yyyy-MM-dd') },
      { field: 'reg_periksa.tgl_registrasi', operator: '<=', value: format(date.value.end, 'yyyy-MM-dd') }
    ]
  }
}

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
  date.value = { start: new Date(), end: new Date() }
  bodyReqs.value.filters = bodyReqs.value.filters.filter((f: OrionFilterInterface) => f.field !== 'reg_periksa.tgl_registrasi')
}

watch(() => status.value, () => {
  if (status.value == 'pending') {
    data.value = null
  }
})

watch(date, useDebounceFn(() => {
  bodyReqs.value.filters = bodyReqs.value.filters.filter((f: OrionFilterInterface) => f.field !== 'reg_periksa.tgl_registrasi')

  bodyReqs.value.filters = [
    ...bodyReqs.value.filters,
    { field: 'reg_periksa.tgl_registrasi', operator: '>=', value: date.value.start ? format(date.value.start, 'yyyy-MM-dd') : undefined },
    { field: 'reg_periksa.tgl_registrasi', operator: '<=', value: date.value.end ? format(date.value.end, 'yyyy-MM-dd') : undefined }
  ]
}, 1300))

watch(() => statusTerkirim.value, useDebounceFn(() => {
  bodyReqs.value.scopes = bodyReqs.value.scopes.filter((s: any) => s.name !== 'hasBerkasPerawatan')
  bodyReqs.value.scopes = bodyReqs.value.scopes.filter((s: any) => s.name !== 'notHasBerkasPerawatan')

  if (statusTerkirim.value == 'terkirim') {
    if (!bodyReqs.value.scopes.some((s: any) => s.name === 'hasBerkasPerawatan')) {
      bodyReqs.value.scopes.push({ name: 'hasBerkasPerawatan' })
    }
  } else if (statusTerkirim.value == 'belum') {
    if (!bodyReqs.value.scopes.some((s: any) => s.name === 'notHasBerkasPerawatan')) {
      bodyReqs.value.scopes.push({ name: 'notHasBerkasPerawatan' })
    }
  }
}, 1300))

watch(() => selectedStatus.value, useDebounceFn(() => {
  bodyReqs.value.scopes = bodyReqs.value.scopes.filter((s: any) => s.name !== 'notHasStatusKlaim')

  if (selectedStatus.value.id == "") {
    bodyReqs.value.filters = bodyReqs.value.filters.filter((f: OrionFilterInterface) => f.field != 'status_klaim.status')
  } else if(selectedStatus.value.id == "belum") {
    if (!bodyReqs.value.scopes.some((s: any) => s.name === 'notHasStatusKlaim')) {
      bodyReqs.value.scopes.push({ name: 'notHasStatusKlaim' })
    }
  } else {
    bodyReqs.value.filters = bodyReqs.value.filters.filter((f: OrionFilterInterface) => f.field != 'status_klaim.status')
    bodyReqs.value.filters = [
      ...bodyReqs.value.filters,
      { field: 'status_klaim.status', operator: '=', value: selectedStatus.value.id }
    ]
  }
}, 1300))

watch(qw, useDebounceFn((value) => {
  bodyReqs.value.search = { value: value ?? '' }
}, 1300))

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
    let showedNoRawat = (data.value as any)?.data.map((d: any) => d?.no_rawat);
    let showedNoSep = (data.value as any)?.data.map((d: any) => d?.no_sep);

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

    await new Promise(resolve => setTimeout(resolve, 2000));

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

<template>
  <UCard>
    <template #header>
      <div class="flex items-start gap-4">
        <UButton icon="i-healthicons-walking" variant="soft" color="sky" square />
        <div>
          <h3 class="text-lg text-sky-600 dark:text-sky-400 font-semibold">Pasien Rawat jalan</h3>
          <p class="text-sm text-cool-500">Daftar pasien rawat jalan berdasarkan nomor sep</p>
        </div>
      </div>
    </template>

    <div class="mb-10 flex flex-col lg:flex-row gap-4 justify-end items-center">
      <ClientOnly fallback="Loading filters...">
        <div class="flex flex-col-reverse lg:flex-row gap-4 items-center justify-center">
          <div class="flex gap-0.5 flex-col">
            <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Status Kirim Berkas</div>
            <div class="p-1.5 px-3 rounded-2xl border border-cool-200 dark:border-cool-700 flex gap-4">
              <URadio v-for="method of [
                { value: '', label: 'Semua' },
                { value: 'terkirim', label: 'Terkirim' },
                { value: 'belum', label: 'Belum' }
              ]" :key="method.value" v-model="statusTerkirim" v-bind="method" />
            </div>
          </div>
          
          <div class="flex gap-0.5 flex-col">
            <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Tanggal Registrasi</div>
            <UPopover>
              <UButton icon="i-tabler-calendar-event" variant="soft" color="sky">
                <span v-if="!date">Tanggal Registrasi</span>
    
                <span v-else-if="typeof date === 'object' && date?.start && date?.end">
                  {{ format(date?.start, 'd MMM, yyy') }} - {{ format(date?.end, 'd MMM, yyy') }}
                </span>
    
                <span v-else>Tanggal Registrasi</span>
              </UButton>
    
              <template #panel="{ close }">
                <DatePicker v-model="date" @close="close" isRange />
    
                <div class="flex justify-end p-3">
                  <UButton color="red" @click="clearDate" icon="i-tabler-circle-x">Clear</UButton>
                </div>
              </template>
            </UPopover>
          </div>
        </div>

        <div class="flex gap-0.5 flex-col w-full md:w-[50%] lg:w-[20%] xl:w-[15%] 2xl:w-[13%]">
          <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Status Klaim</div>
          <USelectMenu v-model="selectedStatus" :options="setStatus" @change="selectedStatus = $event"
            class="w-full" :searchable="true">
            <template #leading>
              <UIcon v-if="selectedStatus.icon" :name="(selectedStatus.icon as string)" class="w-5 h-5" />
            </template>
          </USelectMenu>
        </div>

        <div class="w-full md:w-[50%] lg:w-[20%] xl:w-[15%] 2xl:w-[13%]">
          <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Cari Pasien</div>
          <UInput placeholder="Search..." class="w-full" v-model="qw" />
        </div>        
      </ClientOnly>
    </div>

    <TablePasienRalan :data="(data as any)" :error="(error as any)" :refresh="refresh" :status="status"
      :costStatus="costStatus?.value" :realCostData="realCost" :grouppingCostData="grouppingCost" />

    <div v-if="data && (data as any)?.meta">
      <div class="mt-5 flex flex-col md:flex-row items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Showing : {{ ((data as any)?.meta as any)?.from }}
          to {{ ((data as any)?.meta as any)?.to }}
          of {{ ((data as any)?.meta as any)?.total }} entries
        </p>

        <UPagination v-model="currentPage" :page-count="((data as any).meta as any)?.per_page"
          :total="((data as any)?.meta as any)?.total" />
      </div>
    </div>
  </UCard>
</template>