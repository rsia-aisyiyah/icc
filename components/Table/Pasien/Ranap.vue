<template>
  <UCard class="bg-white dark:bg-gray-800 shadow-md">
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
    <div class="mb-4 flex gap-4 justify-end items-center">
      <!-- Pulang / Belum Pulang -->
      <div class="p-1.5 px-3 rounded-2xl border border-cool-200 dark:border-cool-700 flex gap-4">
        <URadio v-for="method of methods" :key="method.value" v-model="masukKeluar" v-bind="method" />
      </div>

      <!-- tanggal masuk - keluar -->
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton icon="i-heroicons-calendar-days-20-solid" :disabled="masukKeluar == '-'"
          :color="masukKeluar == '-' ? 'gray' : 'primary'">
          <span v-if="!date">Tgl Masuk - Tgl Keluar</span>
          <span v-else-if="typeof date === 'object'">
            {{ format(date.start, 'd MMM, yyy') }} - {{ format(date.end, 'd MMM, yyy') }}
          </span>
          <span v-else>
            {{ format(date, 'd MMM, yyy') }}
          </span>
        </UButton>

        <template #panel="{ close }">
          <DatePicker v-model="date" @close="close" isRange />
        </template>

      </UPopover>

      <!-- search -->
      <UInput v-model="bodyReqs.search.value" placeholder="Search..." class="w-[20%]" />
    </div>

    <!-- Table -->
    <UTable :rows="pasienRanap?.data" :columns="pasienRanapColumns" :loading="pending">
      <!-- Action -->
      <template #action-data="{ row }">
        <UButton :disabled="!row.sep?.no_sep" :to="buildUrl(row.pasien.no_rkm_medis)" icon="i-uil-external-link-alt"
          :variant="!row.sep?.no_sep ? 'solid' : 'soft'" :color="!row.sep?.no_sep ? 'gray' : 'primary'" target="_blank"
          size="xs" square>
          Data Klaim
        </UButton>
      </template>


      <!-- Data -->
      <template #no_rawat-data="{ row }">
        <UBadge color="sky" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_rawat ?? "-" }}
            <template v-if="row.no_rawat">
              <UButton icon="i-tabler-copy" color="sky" variant="soft" size="2xs"
                @click="isSupported && copy(row.no_rawat)" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #sep.no_sep-data="{ row }">
        <UBadge :color="row.sep?.no_sep ? 'primary' : 'red'" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.sep?.no_sep ?? "-" }}
            <template v-if="row.sep?.no_sep">
              <UButton icon="i-tabler-copy" color="primary" variant="soft" size="2xs"
                @click="isSupported && copy(row.sep?.no_sep)" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #pasien.nm_pasien-data="{ row }">
        <span class="font-bold text-cool-600">{{ row.pasien?.nm_pasien ?? "-" }}</span>
        <div class="flex gap-1 mt-1">
          <UBadge size="xs" color="gray">{{ row.pasien?.no_rkm_medis ?? "-" }}</UBadge>
          <span class="text-gray-500 font-semibold text-sm px-1">|</span>
          <span class="text-gray-500 font-semibold text-sm">{{ row.sum_lama }} Hari</span>
        </div>
      </template>

      <template #reg_periksa?.tgl_registrasi-data="{ row }">
        <div class="font-semibold">{{ new Date(row.reg_periksa?.tgl_registrasi).toLocaleDateString('id-ID', {
          weekday: 'short', year: 'numeric',
          month: 'short', day: 'numeric'
        }) }}</div>
        <div>{{ row.reg_periksa?.jam_reg }}</div>
      </template>

      <template #tgl_keluar-data="{ row }">
        <template v-if="row.tgl_keluar && row.tgl_keluar != '0000-00-00'">
          <div class="font-semibold">{{ new Date(row.tgl_keluar).toLocaleDateString('id-ID', {
            weekday: 'short', year: 'numeric', month: 'short',
            day: 'numeric'
          }) }}</div>
          <div>{{ row.jam_keluar }}</div>
        </template>

        <template v-else>
          -
        </template>
      </template>

      <!-- ---------- COST DATA -->
      <template #real_cost-data="{ row }">
        <span class="text-teal-500 font-semibold">
          <USkeleton class="h-4 w-[100px]" v-if="pendingFetchCost" />
          <span v-if="!pendingFetchCost">
            {{ rc?.[row.no_rawat] ? new Intl.NumberFormat('id-ID', {
              style: 'currency',
              currency: 'IDR',
              maximumFractionDigits: 0
            }).format(rc?.[row.no_rawat].total) : '-' }}
          </span>
        </span>
      </template>

      <template #mining_tarif-data="{ row }">
        <span class="text-indigo-400">
          <USkeleton class="h-4 w-[100px]" />
        </span>
      </template>

      <template #groupping_tarif-data="{ row }">
        <span class="text-violet-400">
          <USkeleton class="h-4 w-[100px]" v-if="pendingFetchCost" />
          <span v-if="!pendingFetchCost">
            <span v-if="row.sep">
              {{
                gc?.find((item: any) => item.no_sep === row.sep?.no_sep)?.tarif
                  ? new Intl.NumberFormat('id-ID', {
                    style: 'currency',
                    currency: 'IDR',
                    maximumFractionDigits: 0
                  }).format(gc.find((item: any) => item.no_sep === row.sep?.no_sep)?.tarif)
                  : '-'
              }}
            </span>

            <span v-else>-</span>
          </span>
        </span>
      </template>


      <!-- ---------- TABLE HEADER -->
      <template #real_cost-header="{ column }">
        <span class="text-teal-500 bg-teal-100/70 rounded-md px-2 py-1">
          {{ column.label }}
        </span>
      </template>

      <template #mining_tarif-header="{ column }">
        <span class="text-indigo-500 bg-indigo-100/70 rounded-md px-2 py-1">
          {{ column.label }}
        </span>
      </template>

      <template #groupping_tarif-header="{ column }">
        <span class="text-violet-500 bg-violet-100/70 rounded-md px-2 py-1">
          {{ column.label }}
        </span>
      </template>
    </UTable>

    <!-- pagination -->
    <div v-if="pasienRanap && pasienRanap.meta">
      <div class="mt-5 flex items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Showing : {{ (pasienRanap.meta as any).from }}
          to {{ (pasienRanap.meta as any).to }}
          of {{ (pasienRanap.meta as any).total }} entries
        </p>
        <UPagination v-model="currentPage" :page-count="(pasienRanap.meta as any).per_page"
          :total="(pasienRanap.meta as any).total" />
      </div>
    </div>
  </UCard>
</template>

<script lang="ts" setup>
import type { ResourcePagination } from '~/types/apiResponse'
import { pasienRanapColumns } from '~/common/data/columns'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { format } from 'date-fns'

const buildUrl = (noRawat: string) => `/sep/${btoa(noRawat)}`

const toast = useToast()
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()
const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })

const methods = [
  { value: '-', label: 'Belum Pulang' },
  { value: 'masuk', label: 'Tanggal Masuk' },
  { value: 'keluar', label: 'Tanggal Keluar' }
]

const rc = ref<any>()
const gc = ref<any>()
const pendingFetchCost = ref(false)
const showedNoRawat = ref<any[]>([])
const showedNoSep = ref<any[]>([])
const currentPage = ref(1)
const masukKeluar = ref('-')
const date = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
})
const bodyReqs = ref<any>({
  filters: [
    { field: 'stts_pulang', operator: '=', value: '-' },
    { field: 'regPeriksa.kd_pj', operator: 'in', value: ['A01', 'A05'] }
  ],
  sort: [
    { field: 'no_rawat', direction: 'desc' }
  ],
  aggregates: [
    { type: "sum", relation: "lamaInap", field: "lama" }
  ],
  search: { value: '' },
})

function updateFilters() {
  bodyReqs.value.filters = []

  // Jika search.value tidak kosong, tambahkan filter yang spesifik dan atur currentPage menjadi 1
  if (bodyReqs.value.search.value != '') {
    bodyReqs.value.filters.push({ field: 'stts_pulang', operator: '!=', value: 'Pindah Kamar' });
    currentPage.value = 1;
    return; // Keluar dari fungsi updateFilters karena filter yang lain tidak perlu ditambahkan
  }

  if (masukKeluar.value === 'masuk') {
    bodyReqs.value.filters.push({ field: 'regPeriksa.tgl_registrasi', operator: '>=', value: format(date.value.start, 'yyyy-MM-dd') })
    bodyReqs.value.filters.push({ field: 'regPeriksa.tgl_registrasi', operator: '<=', value: format(date.value.end, 'yyyy-MM-dd') })
  } else if (masukKeluar.value === 'keluar') {
    bodyReqs.value.filters.push({ field: 'tgl_keluar', operator: '>=', value: format(date.value.start, 'yyyy-MM-dd') })
    bodyReqs.value.filters.push({ field: 'tgl_keluar', operator: '<=', value: format(date.value.end, 'yyyy-MM-dd') })
  }

  if (bodyReqs.value.search.value == '' && masukKeluar.value === '-') {
    bodyReqs.value.filters.push({ field: 'stts_pulang', operator: '=', value: '-' })
  } else {
    bodyReqs.value.filters.push({ field: 'stts_pulang', operator: '!=', value: '-' })
    bodyReqs.value.filters.push({ field: 'stts_pulang', operator: '!=', value: 'Pindah Kamar' })
  }

  bodyReqs.value.filters.push({ field: 'regPeriksa.kd_pj', operator: 'in', value: ['A01', 'A05'] })
  currentPage.value = 1
}

const { data: pasienRanap, pending, status } = await useAsyncData<ResourcePagination>(
  'pasien/ranap',
  () => $fetch(`${config.public.API_V2_URL}/pasien/ranap/search?page=${currentPage.value}`, {
    method: 'POST',
    body: JSON.stringify(bodyReqs.value),
    headers: {
      Authorization: `Bearer ${tokenStore.accessToken}`
    }
  }), {
  watch: [currentPage, bodyReqs, bodyReqs.value]
})

function updateShowedData() {
  showedNoRawat.value = pasienRanap.value?.data.map((item: any) => item.no_rawat) ?? []
  showedNoSep.value = pasienRanap.value?.data.map((item: any) => {
    if (item.sep) {
      return item.sep.no_sep
    }
  }).filter((noSep) => noSep !== undefined) ?? []
}

async function fetchData() {
  pendingFetchCost.value = true

  const realCostPromise = $fetch(`${config.public.API_V2_URL}/pasien/ranap/real-cost`, {
    method: 'POST',
    body: { filters: [{ field: 'no_rawat', operator: 'in', value: showedNoRawat.value }] },
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
  })

  const groupingCostPromise = $fetch(`${config.public.API_V2_URL}/pasien/ranap/grouping-cost`, {
    method: 'POST',
    body: { filters: [{ field: 'no_Sep', operator: 'in', value: showedNoSep.value }] },
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
  })

  const [realCostResponse, groupingCostResponse] = await Promise.all<any>([realCostPromise, groupingCostPromise])

  if (realCostResponse.error) {
    console.error('Error fetching real cost:', realCostResponse.error)
  } else {
    rc.value = realCostResponse.data || []
  }

  if (groupingCostResponse.error) {
    console.error('Error fetching grouping cost:', groupingCostResponse.error)
  } else {
    gc.value = groupingCostResponse.data || []
  }

  pendingFetchCost.value = false
}

onMounted(() => {
  updateShowedData()
})

// Watch showedNoRawat and showedNoSep for changes
watch([showedNoRawat, showedNoSep], fetchData, { immediate: true })

// Watch pasienRanap for changes
watch(pasienRanap, updateShowedData)

// Watch date, masukKeluar, and search for changes
watch([date, masukKeluar, bodyReqs.value.search], useDebounceFn(updateFilters, 800), { deep: true })

// Watch copied for changes
watch(copied, (val) => {
  if (val) {
    toast.add({
      icon: 'i-uil-check-circle',
      title: 'Copied!',
      description: 'Text copied to clipboard',
      color: 'lime',
      timeout: 2000
    })
  }
})
</script>