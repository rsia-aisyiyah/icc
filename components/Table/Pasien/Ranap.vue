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
      <!-- Pulang / Belum Pulang -->
      <div class="p-1.5 px-3 rounded-2xl border border-cool-200 dark:border-cool-700 flex gap-4">
        <URadio v-for="method of methods" :key="method.value" v-model="masukKeluar" v-bind="method" />
      </div>

      <!-- tanggal masuk - keluar -->
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton icon="i-tabler-calendar-event" :disabled="masukKeluar == '-'"
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
      <UInput v-model="bodyReqs.search.value" placeholder="Search..." class="w-full md:w-[50%] lg:w-[20%]" />
    </div>

    <!-- Table -->
    <UTable :rows="pasienRanap?.data" :columns="pasienRanapColumns" :loading="status == 'pending'">
      <!-- Action -->
      <template #action-data="{ row }">
        <div class="flex gap-1 flex-col">
          <div>
            <UButton :disabled="!row.sep?.no_sep" :to="buildUrl(row.pasien.no_rkm_medis)" icon="i-tabler-external-link"
              :variant="!row.sep?.no_sep ? 'solid' : 'soft'" :color="!row.sep?.no_sep ? 'gray' : 'primary'"
              target="_blank" size="xs" square>
              Data Klaim
            </UButton>
          </div>

          <div class="flex gap-1">
            <UButton square :disabled="!row.sep?.no_sep" icon="i-tabler-file-description"
              :color="!row.sep?.no_sep ? 'gray' : 'primary'" :variant="!row.sep?.no_sep ? 'solid' : 'soft'"
              @click="openDokumen = true; pdfReady = false; sep = row.sep?.no_sep" size="xs" />

            <UDropdown :items="[
              [{
                label: 'Status & Note',
                icon: 'i-tabler-note',
                click: () => {
                  setSepRawat(row)
                  openModalKlaimFeedback = true
                }
              }]
            ]">
              <UButton square :variant="!row.sep?.no_sep ? 'solid' : 'soft'" size="xs"
                :color="!row.sep?.no_sep ? 'gray' : 'primary'" :disabled="!row.sep?.no_sep"
                trailing-icon="i-heroicons-chevron-down-20-solid" />
            </UDropdown>
          </div>
        </div>
      </template>


      <!-- Data -->
      <template #no_rawat-data="{ row }">
        <UBadge color="sky" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_rawat ?? "-" }}
            <template v-if="row.no_rawat && isSupported">
              <UButton icon="i-tabler-copy" color="sky" variant="soft" size="2xs" @click="copy(row.no_rawat)" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #sep.no_sep-data="{ row }">
        <div class="flex flex-col gap-1">
          <UBadge :color="row.sep?.no_sep ? 'primary' : 'primary'" variant="soft">
            <div class="flex gap-2 items-center justify-between w-full pl-1">
              {{ row.sep?.no_sep ?? "-" }}
              <template v-if="row.sep?.no_sep && isSupported">
                <UButton icon="i-tabler-copy" color="primary" variant="soft" size="2xs" @click="copy(row.sep?.no_sep)" />
              </template>
            </div>
          </UBadge>

          <UBadge color="sky" variant="soft">
            <div class="flex gap-2 items-center justify-between w-full pl-1">
              {{ row.no_rawat ?? "-" }}
              <template v-if="row.no_rawat && isSupported">
                <UButton icon="i-tabler-copy" color="sky" variant="soft" size="2xs" @click="copy(row.no_rawat)" />
              </template>
            </div>
          </UBadge>
        </div>
      </template>

      <template #sep.diagawal-data="{ row }">
        <UBadge color="red" variant="soft">
          <div class="flex gap-2 items-center justify-center">
            {{ row.sep ? row.sep.diagawal : "-" }}
          </div>
        </UBadge>
      </template>

      <template #pasien.nm_pasien-data="{ row }">
        <span class="font-bold">{{ row.pasien?.nm_pasien ?? "-" }}</span>
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
            }).format(rc?.[row.no_rawat].total ?? 0) : '-' }}
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
                  }).format(gc.find((item: any) => item.no_sep === row.sep?.no_sep)?.tarif ?? 0)
                  : '-'
              }}
            </span>

            <span v-else>-</span>
          </span>
        </span>
      </template>


      <!-- ---------- TABLE HEADER -->
      <template #real_cost-header="{ column }">
        <span
          class="text-teal-500 bg-teal-100/70 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500 dark:border whitespace-nowrap rounded-md px-2 py-1">
          {{ column.label }}
        </span>
      </template>

      <template #mining_tarif-header="{ column }">
        <span
          class="text-indigo-500 bg-indigo-100/70 dark:text-indigo-400 dark:bg-indigo-500/20 dark:border-indigo-500 dark:border whitespace-nowrap rounded-md px-2 py-1">
          {{ column.label }}
        </span>
      </template>

      <template #groupping_tarif-header="{ column }">
        <span
          class="text-violet-500 bg-violet-100/70 dark:text-violet-400 dark:bg-violet-500/20 dark:border-violet-500 dark:border whitespace-nowrap rounded-md px-2 py-1">
          {{ column.label }}
        </span>
      </template>

      <template #tgl_keluar-header="{ column }">
        <stan class="whitespace-nowrap">
          {{ column.label }}
        </stan>
      </template>
    </UTable>

    <!-- pagination -->
    <div v-if="pasienRanap && pasienRanap.meta">
      <div class="mt-5 flex flex-col md:flex-row items-center justify-between">
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

  <USlideover v-model="openDokumen" :ui="{ width: 'w-screen max-w-[50%]' }">
    <div class="p-4 flex-1">
      <UButton color="gray" variant="ghost" size="sm" icon="i-heroicons-x-mark-20-solid"
        class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="openDokumen = false" />
      <div v-if="!pdfReady" class="absolute inset-0 flex justify-center items-center bg-gray-100 z-10 bg-gray-200/50 dark:bg-gray-800/50">
        <div class="loader">Loading...</div>
      </div>

      <!-- open new tab pdfUrl -->
      <UButton color="primary" size="xs" icon="i-tabler-external-link" class="absolute bottom-5 left-5 z-10"
        :to="pdfUrl" target="_blank">
        Open in new tab
      </UButton>

      <iframe :src="pdfUrl" frameborder="0" width="100%" height="100%" @load="pdfReady = true"></iframe>
    </div>
  </USlideover>

  <!-- Modal Update Status -->
  <ModalUpdateStatus v-model:isOpen="openModalUpdateStatus" :sep="sep" :noRawat="noRawat" />
  <!-- Modal Klaim Feedback -->
  <ModalKlaimFeedback v-model:isOpen="openModalKlaimFeedback" :sep="sep" :noRawat="noRawat" />
</template>

<script lang="ts" setup>
import type { GroupingCostRawatInap, RealCostRawatInap, ResourcePagination } from '~/types'
import { pasienRanapColumns } from '~/common/data/columns'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { format } from 'date-fns'

const buildUrl = (noRawat: string) => `/sep/${btoa(noRawat)}`

const sep = ref('')
const noRawat = ref('')
const pdfUrl = ref('')
const toast = useToast()
const pdfReady = ref(false)
const openDokumen = ref(false)
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const openModalUpdateStatus = ref(false);
const openModalKlaimFeedback = ref(false);

// Watch for SEP changes and update PDF URL
watch(sep, (val) => {
  if (val) {
    pdfUrl.value = `${config.public.API_V2_URL}/sep/${val}/print?token=${tokenStore.accessToken}`
  }
})

const setSepRawat = (row: any) => {
  sep.value = row.sep?.no_sep
  noRawat.value = row?.no_rawat
}

const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })

const methods = [
  { value: '-', label: 'Belum Pulang' },
  { value: 'masuk', label: 'Tanggal Masuk' },
  { value: 'keluar', label: 'Tanggal Keluar' }
]

const rc = ref<RealCostRawatInap[]>([])
const gc = ref<GroupingCostRawatInap[]>([])
const pendingFetchCost = ref(false)
const showedNoRawat = ref<string[]>([])
const showedNoSep = ref<string[]>([])
const currentPage = ref(1)
const masukKeluar = ref('-')
const date = ref({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
})
const bodyReqs = ref({
  filters: [
    { field: 'stts_pulang', operator: '=', value: '-' },
    { field: 'regPeriksa.kd_pj', operator: 'in', value: ['A01', 'A05'] }
  ],
  sort: [{ field: 'no_rawat', direction: 'desc' }],
  aggregates: [{ type: "sum", relation: "lamaInap", field: "lama" }],
  search: { value: '' }
})

// Update filters based on the selected options
function updateFilters() {
  bodyReqs.value.filters = []

  const { search, filters } = bodyReqs.value

  if (search.value) {
    filters.push({ field: 'stts_pulang', operator: '!=', value: 'Pindah Kamar' })
    currentPage.value = 1
    return
  }

  const dateFilter = masukKeluar.value === 'masuk'
    ? 'regPeriksa.tgl_registrasi'
    : 'tgl_keluar'

  if (masukKeluar.value !== '-') {
    filters.push({ field: dateFilter, operator: '>=', value: format(date.value.start, 'yyyy-MM-dd') })
    filters.push({ field: dateFilter, operator: '<=', value: format(date.value.end, 'yyyy-MM-dd') })
  }

  filters.push({
    field: 'stts_pulang',
    operator: masukKeluar.value === '-' ? '=' : '!=',
    value: '-'
  })

  filters.push({ field: 'regPeriksa.kd_pj', operator: 'in', value: ['A01', 'A05'] })
  currentPage.value = 1
}

// Fetch pasienRanap data with filters
const { data: pasienRanap, status, refresh } = await useAsyncData<ResourcePagination>(
  'pasien/ranap',
  () => $fetch(`${config.public.API_V2_URL}/pasien/ranap/search?page=${currentPage.value}`, {
    method: 'POST',
    body: JSON.stringify(bodyReqs.value),
    headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
  }), {
  watch: [currentPage, bodyReqs]
})

// Update displayed data based on pasienRanap changes
function updateShowedData() {
  showedNoRawat.value = pasienRanap.value?.data.map((item: any) => item.no_rawat) ?? []
  showedNoSep.value = pasienRanap.value?.data.map((item: any) => item.sep?.no_sep).filter(Boolean) ?? []
}

// Fetch real and grouping costs
async function fetchData() {
  pendingFetchCost.value = true

  const [realCostResponse, groupingCostResponse] = await Promise.all([
    $fetch(`${config.public.API_V2_URL}/pasien/ranap/real-cost`, {
      method: 'POST',
      body: { filters: [{ field: 'no_rawat', operator: 'in', value: showedNoRawat.value }] },
      headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
    }) as any,
    $fetch(`${config.public.API_V2_URL}/pasien/ranap/grouping-cost`, {
      method: 'POST',
      body: { filters: [{ field: 'no_sep', operator: 'in', value: showedNoSep.value }] },
      headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
    }) as any
  ])

  rc.value = realCostResponse.data || []
  gc.value = groupingCostResponse.data || []
  pendingFetchCost.value = false
}

onMounted(updateShowedData)

watch([showedNoRawat, showedNoSep], fetchData, { immediate: true })
watch(pasienRanap, updateShowedData)
watch([date, masukKeluar, bodyReqs.value.search], useDebounceFn(async () => {
  status.value = 'pending'
  await new Promise((resolve) => setTimeout(resolve, 1300))

  updateFilters()
  refresh()
}, 800), { deep: true })

watch(copied, (val) => {
  if (val) {
    toast.add({
      icon: 'i-tabler-circle-check',
      title: 'Copied!',
      description: 'Text copied to clipboard',
      color: 'lime',
      timeout: 2000
    })
  }
})
</script>
