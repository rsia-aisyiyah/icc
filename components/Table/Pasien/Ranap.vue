<template>
  <UCard>
    <!-- Header -->
    <template #header>
      <div class="flex items-start gap-4">
        <UButton icon="i-healthicons-inpatient" variant="soft" square />
        <div>
          <h3 class="text-lg font-semibold">Pasien Rawat Inap</h3>
          <p class="text-sm text-gray-500">Daftar pasien rawat inap yang belum pulang</p>
        </div>
      </div>
    </template>

    <!-- Filter and search -->
    <div class="mb-4 flex gap-4 justify-end items-center">
      <!-- Pulang / Belum Pulang -->
      <div class="p-1.5 px-3 rounded-2xl border border-gray-700 flex gap-4">
        <URadio v-for="method of methods" :key="method.value" v-model="masukKeluar" v-bind="method" />
      </div>

      <!-- tanggal masuk - keluar -->
      <UPopover :popper="{ placement: 'bottom-start' }">
        <UButton icon="i-heroicons-calendar-days-20-solid" :disabled="masukKeluar == '-'" :color="masukKeluar == '-' ? 'gray' : 'primary'" >
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
    <UTable :rows="pasienRanap?.data" :columns="columns" :loading="pending">
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
        <span class="font-bold">{{ row.pasien?.nm_pasien ?? "-" }}</span> <br />
        <div class="flex gap-1 mt-1">
          <UBadge size="xs" color="gray">{{ row.pasien?.no_rkm_medis ?? "-" }}</UBadge>
          <span class="text-gray-500 font-semibold text-sm px-1">|</span>
          <span class="text-gray-500 font-semibold text-sm">{{ row.sum_lama }} Hari</span>
        </div>
      </template>

      <template #reg_periksa?.tgl_registrasi-data="{ row }">
        {{ new Date(row.reg_periksa?.tgl_registrasi).toLocaleDateString('id-ID', {
          weekday: 'long', year: 'numeric',
          month: 'long', day: 'numeric'
        }) }} <br />
        {{ row.reg_periksa?.jam_reg }}
      </template>

      <template #tgl_keluar-data="{ row }">
        <template v-if="row.tgl_keluar && row.tgl_keluar != '0000-00-00'">
          {{ new Date(row.tgl_keluar).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long',
            day: 'numeric'
          }) }} <br />
          {{ row.tgl_keluar }}
        </template>

        <template v-else>
          -
        </template>
      </template>


      <!-- ---------- COST DATA -->
      <template #real_cost-data="{ row }">
        <span class="text-primary">
          <USkeleton class="h-4 w-[120px]" v-if="realCostPending" />
          <span v-if="!realCostPending">
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
          <USkeleton class="h-4 w-[120px]" />
        </span>
      </template>

      <template #groupping_tarif-data="{ row }">
        <span class="text-violet-400">
          <USkeleton class="h-4 w-[120px]" />
        </span>
      </template>


      <!-- ---------- TABLE HEADER -->
      <template #real_cost-header="{ column }">
        <span class="text-primary">
          {{ column.label }}
        </span>
      </template>

      <template #mining_tarif-header="{ column }">
        <span class="text-indigo-400">
          {{ column.label }}
        </span>
      </template>

      <template #groupping_tarif-header="{ column }">
        <span class="text-violet-400">
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
import type { BiayaRanapResponse, BiayaByNoRawat } from '~/types/biaya'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { format } from 'date-fns'

const toast = useToast()
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })
watch(copied, (val) => {
  val && toast.add({
    icon: 'i-uil-check-circle',
    title: 'Copied!',
    description: 'Text copied to clipboard',
    color: 'lime',
    timeout: 2000
  })
})

const methods = [
  { value: '-', label: 'Belum Pulang' },
  { value: 'masuk', label: 'Tanggal Masuk' },
  { value: 'keluar', label: 'Tanggal Keluar' }
]

const rc = ref<BiayaByNoRawat>()
const showedNoRawat = ref<any[]>([])
const currentPage = ref(1)
const masukKeluar = ref('-')
const date = ref<any>({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
})
const bodyReqs = ref<any>({
  filters: [
    { field: 'stts_pulang', operator: '=', value: '-' }
  ],
  sort: [
    { field: 'no_rawat', direction: 'desc' }
  ],
  aggregates: [
    { type: "sum", relation: "lamaInap", field: "lama" }
  ],
  search: { value: '' },
});

// watch date and masukKeluar
watch([date, masukKeluar], () => {
  bodyReqs.value.filters = []

  if (masukKeluar.value === 'masuk') {
    bodyReqs.value.filters.push({ field: 'regPeriksa.tgl_registrasi', operator: '>=', value: date.value.start })
    bodyReqs.value.filters.push({ field: 'regPeriksa.tgl_registrasi', operator: '<=', value: date.value.end })
  } else if (masukKeluar.value === 'keluar') {
    bodyReqs.value.filters.push({ field: 'tgl_keluar', operator: '>=', value: date.value.start })
    bodyReqs.value.filters.push({ field: 'tgl_keluar', operator: '<=', value: date.value.end })
  }

  if (masukKeluar.value === '-') {
    bodyReqs.value.filters.push({ field: 'stts_pulang', operator: '=', value: '-' })
  } else {
    bodyReqs.value.filters.push({ field: 'stts_pulang', operator: '!=', value: '-' })
    bodyReqs.value.filters.push({ field: 'stts_pulang', operator: '!=', value: 'Pindah Kamar' })
  }

  currentPage.value = 1
})

const columns = [
  { label: "No Rawat", key: "no_rawat" },
  { label: "No SEP", key: "sep.no_sep" },
  { label: "Nama Pasien", key: "pasien.nm_pasien" },
  { label: "Diagnosa Awal", key: "sep.diagawal" },
  { label: "Tanggal Masuk", key: "reg_periksa?.tgl_registrasi" },
  { label: "Tanggal Keluar", key: "tgl_keluar" },
  { label: "Real Cost", key: "real_cost" },
  { label: "Groupping tarif", key: "groupping_tarif" },
  { label: "Mining tarif", key: "mining_tarif" },
  { label: "Action", key: "action" },
];

const { data: pasienRanap, pending, status } = await useAsyncData<ResourcePagination>(
  'pasien/ranap',
  () => $fetch(`${config.public.API_V2_URL}/pasien/ranap/search?page=${currentPage.value}&include=sep,regPeriksa`, {
    method: 'POST',
    body: JSON.stringify(bodyReqs.value),
    headers: {
      Authorization: `Bearer ${tokenStore.accessToken}`
    }
  }), {
  watch: [currentPage, bodyReqs.value],
});

onMounted(() => {
  showedNoRawat.value = pasienRanap.value?.data.map((item: any) => item.no_rawat) ?? []
})

// pluck all no_rawat from pasienRanap
watch(pasienRanap, () => {
  showedNoRawat.value = pasienRanap.value?.data.map((item: any) => item.no_rawat) ?? []

  console.log(pasienRanap.value)
})

// fetch realcost
const { data: realCost, pending: realCostPending, error: realCostError, refresh: realCostRefresh, status: realCostStatus } = await useAsyncData<BiayaRanapResponse>(
  'realcost',
  () => $fetch(`${config.public.API_V2_URL}/pasien/ranap/tarif`, {
    method: 'POST',
    body: {
      "filters" : [
        { "field" : "no_rawat", "operator" : "in", "value" : showedNoRawat.value }
      ]
    },
    headers: {
      Authorization: `Bearer ${tokenStore.accessToken}`
    }
  }), {
  watch: [showedNoRawat]
});

watch(realCost, () => {
  rc.value = <any>[];
  if (realCost.value) {
    rc.value = realCost.value.data
  }
})
</script>