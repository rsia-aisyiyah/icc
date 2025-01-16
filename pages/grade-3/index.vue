<script setup lang="ts">
import { ref, watch } from 'vue';
import { format } from 'date-fns';
import { useClipboard, useDebounceFn } from '@vueuse/core'
import type { ResourcePagination } from '~/types';

const token = useAccessTokenStore()
const config = useRuntimeConfig()
const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })
const dateType = [
  { value: 'reg_periksa.tgl_registrasi', label: 'Masuk' },
  { value: 'kamar_inap.tgl_keluar', label: 'Keluar' },
  { value: 'tglsep', label: 'SEP' }
]

const date = ref<any>({
  start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
  end: new Date()
})

const qw             = ref<any>('');  // Reaktif untuk pencarian
const currentPage    = ref(1);        // Reaktif untuk halaman
const filters        = ref<any>({});  // Objek filters
const statusTerkirim = ref('');       // Reaktif untuk statusTerkirim

const clearDate = () => {
  date.value = {
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    end: new Date()
  };
};

const updateFilters = () => {
  filters.value.filters = [];

  // Search
  if (qw.value) {
    filters.value.search = {
      value: qw.value,
    };
  } else {
    delete filters.value.search;
  }

  // Filters
  if (date.value.start && date.value.end) {
    filters.value.filters.push({
      field: statusTerkirim.value,
      operator: '>=',
      value: format(date.value.start, 'yyyy-MM-dd'),
    });

    filters.value.filters.push({
      field: statusTerkirim.value,
      operator: '<=',
      value: format(date.value.end, 'yyyy-MM-dd'),
    });
  }

  if (statusTerkirim.value == 'kamar_inap.tgl_keluar') {
    filters.value.filters.push({
      field: 'kamar_inap.stts_pulang',
      operator: '!=',
      value: 'Pindah Kamar',
    });
  }

  filters.value.filters.push({
    field: 'groupStage.code_cbg',
    operator: 'like',
    value: '%-III',
  });

  // Scopes scopes
  filters.value.scopes = [
    { name: "selectColumns", parameters: ["no_sep,no_rawat,nomr,tglsep"] }
  ];

  // Sort
  filters.value.sort = [
    { field: 'no_rawat', direction: 'desc' }
  ];

  // Includes
  filters.value.includes = [
    { relation: 'pasien' },
    { relation: 'groupStage' },
    { relation: 'tanggal_pulang' },
  ];
};

const { data, error, refresh, status, clear } = await useAsyncData<ResourcePagination>(
  'sep/search/grade-3',
  () => $fetch(`${config.public.API_V2_URL}/sep/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      Accept: 'application/json',
      ContentType: 'application/json'
    },
    body: JSON.stringify(filters.value),
    query: { page: currentPage.value }
  }),
  { watch: [currentPage, filters.value], immediate: false, lazy: true }
)

watch([qw, date, statusTerkirim, currentPage], () => {
  clear()
  useDebounceFn(updateFilters, 800)()
}, { deep: true });

onMounted(() => {
  statusTerkirim.value = dateType[1].value;
});
</script>

<template>
  <UCard>
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-start gap-4">
          <UButton icon="i-tabler-alert-triangle" variant="soft" color="yellow" square />
          <div>
            <h3 class="text-lg text-yellow-600 dark:text-yellow-400 font-semibold">Pasien Grade III</h3>
            <p class="text-sm text-cool-500">Daftar pasien rawat jalan berdasarkan nomor sep</p>
          </div>
        </div>

        <!-- button -->
        <UButton square icon="i-tabler-file-type-pdf" variant="solid" color="rose"
          :to="`${config.public.API_V2_URL}/sep/grade-3/pdf?tgl_awal=${format(date.start, `yyyy-MM-dd`)}&tgl_akhir=${format(date.end, `yyyy-MM-dd`)}&jenis_tanggal=${statusTerkirim}&token=${token.accessToken}`" target="_blank">
          Generate
        </UButton>
      </div>
    </template>

    <div>
      <ClientOnly fallback="Loading Component ...">
        <div class="mb-10 flex flex-col lg:flex-row gap-4 justify-center items-center">
          <div class="flex flex-col-reverse lg:flex-row gap-4 items-center justify-center">
            <div class="flex gap-0.5 flex-col">
              <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Tanggal Registrasi</div>
              <UPopover>
                <UButton icon="i-tabler-calendar-event" variant="soft" color="yellow">
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

            <div class="flex gap-0.5 flex-col">
              <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Jenis Tanggal</div>
              <div class="p-1.5 px-3 rounded-2xl border border-cool-200 dark:border-cool-700 flex gap-4">
                <URadio v-model="statusTerkirim" v-for="item in dateType" :key="item.value" v-bind="item" />
              </div>
            </div>
          </div>

          <div class="w-full md:w-[50%] lg:w-[20%] xl:w-[15%] 2xl:w-[13%]">
            <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Cari Pasien</div>
            <UInput placeholder="Search..." class="w-full" v-model="qw" />
          </div>
        </div>
      </ClientOnly>
    </div>

    <div>
      <ClientOnly fallback="Loading Tabel Pasien Grade III ...">
        <UTable :rows="(data as any)?.data" :loading="status === 'pending'" :columns="[
          { label: 'No. SEP', key: 'no_sep' },
          { label: 'Nama Pasien', key: 'pasien.nm_pasien', sortable: true },
          { label: 'Rekam Medis', key: 'nomr' },
          { label: 'Kode CBG\'s', key: 'group_stage.code_cbg', sortable: true },
          { label: 'Tarif Grouping', key: 'group_stage.tarif', sortable: true },
        ]">
          <template #no_sep-data="{ row }">
            <UBadge size="xs" variant="soft">
              <div class="flex gap-2 items-center justify-between w-full pl-1">
                {{ row.no_sep ?? "-" }}
                <template v-if="row.no_sep && isSupported">
                  <UButton icon="i-tabler-copy" variant="soft" size="2xs" @click="copy(row.no_sep)" />
                </template>
              </div>
            </UBadge>
          </template>

          <template #nomr-data="{ row }">
            <UBadge size="xs" color="gray" variant="soft">
              <div class="flex gap-2 items-center justify-between w-full pl-1">
                {{ row.nomr ?? "-" }}
                <template v-if="row.nomr && isSupported">
                  <UButton icon="i-tabler-copy" color="white" variant="soft" size="2xs" @click="copy(row.nomr)" />
                </template>
              </div>
            </UBadge>
          </template>

          <template #group_stage.code_cbg-data="{ row }">
            <UBadge size="xs" color="yellow" variant="soft">
              <div class="flex gap-2 items-center justify-between w-full pl-1">
                {{ row.group_stage.code_cbg ?? "-" }}
                <template v-if="row.group_stage.code_cbg && isSupported">
                  <UButton icon="i-tabler-copy" color="yellow" variant="soft" size="2xs"
                    @click="copy(row.group_stage.code_cbg)" />
                </template>
              </div>
            </UBadge>
          </template>

          <template #group_stage.tarif-data="{ row }">
            <span class="font-bold dark:text-violet-400 text-violet-600 ">{{ new Intl.NumberFormat('id-ID', {
              style: 'currency', currency: 'IDR',
              minimumFractionDigits: 0
            }).format(row.group_stage.tarif) }}</span>
          </template>
        </UTable>

        <div v-if="data && data?.meta">
          <div class="mt-5 flex flex-col md:flex-row items-center justify-between">
            <p class="text-sm text-gray-500 dark:text-gray-400">
              Showing : {{ (data?.meta as any)?.from }}
              to {{ (data?.meta as any)?.to }}
              of {{ (data?.meta as any)?.total }} entries
            </p>
            <UPagination v-model="currentPage" :total="(data?.meta as any)?.total"
              :page-count="(data?.meta as any)?.per_page" />
          </div>
        </div>
      </ClientOnly>
    </div>
  </UCard>
</template>
