<template>
  <UCard>
    <template #header>
      <div class="flex items-start gap-4">
        <UButton icon="i-healthicons-inpatient" variant="soft" square/>
        <div>
          <h3 class="text-lg font-semibold">Pasien Rawat Inap</h3>
          <p class="text-sm text-gray-500">Daftar pasien rawat inap yang belum pulang</p>
        </div>
      </div>
    </template>

    <UTable :rows="pasienRanap?.data" :columns="columns" :loading="pending">
      <template #no_rawat-data="{ row }">
        <UBadge color="sky" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_rawat ?? "-" }}
            <template v-if="row.no_rawat">
              <UButton icon="i-tabler-copy" color="sky" variant="soft" size="2xs" @click="isSupported && copy(row.no_rawat)" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #sep.no_sep-data="{ row }">
        <UBadge :color="row.sep?.no_sep ? 'primary' : 'red'" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.sep?.no_sep ?? "-" }}
            <template v-if="row.sep?.no_sep">
              <UButton icon="i-tabler-copy" color="primary" variant="soft" size="2xs" @click="isSupported && copy(row.sep?.no_sep)" />
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
        {{ new Date(row.reg_periksa?.tgl_registrasi).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }} <br />
        {{ row.reg_periksa?.jam_reg }}
      </template>

      <template #tgl_keluar-data="{ row }">
        <template v-if="row.tgl_keluar && row.tgl_keluar != '0000-00-00'">
          {{ new Date(row.tgl_keluar).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }} <br />
          {{ row.tgl_keluar }}
        </template>

        <template v-else>
          -
        </template>
      </template>


      <!-- Cost Data -->
      <template #real_cost-data="{ row }">
        <span class="text-primary">
          Rp. 2.000.000,-
        </span>
      </template>

      <template #mining_tarif-data="{ row }">
        <span class="text-indigo-400">
          Rp. 2.000.000,-
        </span>
      </template>

      <template #groupping_tarif-data="{ row }">
        <span class="text-violet-400">
          Rp. 2.000.000,-
        </span>
      </template>


      <!-- HEADER -->
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
import { useClipboard } from '@vueuse/core'

const toast = useToast()
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })

const currentPage = ref(1)

const bodyReqs = {
  filters: [
    { field: 'tgl_keluar', operator: '=', value: '0000-00-00' },
    { field: 'jam_keluar', operator: '=', value: '0000-00-00' },
    { field: 'stts_pulang', operator: '=', value: '-' }
  ],
  sort: [
    { field: 'no_rawat', direction: 'desc' }
  ],
  aggregates : [
      {type: "sum", relation: "lamaInap", field: "lama"}
  ],
  search: { value: '' },
};

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

const { data: pasienRanap, pending, error, refresh } = await useAsyncData<ResourcePagination>(
  'pasien/ranap',
  () => $fetch(`${config.public.API_V2_URL}/pasien/ranap/search?page=${currentPage.value}&limit=10&include=sep,regPeriksa`, {
    method: 'POST',
    body: JSON.stringify(bodyReqs),
    headers: {
      Authorization: `Bearer ${tokenStore.accessToken}`
    }
  }), {
    watch: [currentPage]
  }
);

console.log(pasienRanap.value?.data)
</script>