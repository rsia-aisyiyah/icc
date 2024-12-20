<template>
  <UCard :ui="{ background: 'bg-white dark:bg-cool-900' }">
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
    <ClientOnly fallback="Loading filters...">
      <div class="mb-10 flex flex-col lg:flex-row gap-4 justify-center items-center">
        <div class="flex flex-col gap-4 xl:flex-row">
          <!-- Status Berkas Terkirim -->
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

          <!-- Pulang / Belum Pulang -->
          <div class="flex gap-0.5 flex-col">
            <UTooltip text="Terkait dengan tanggal registrasi disamping" :popper="{ placement: 'top' }" :ui="{ background: 'bg-amber-200 dark:bg-amber-700' }">
              <div class="flex gap-2 items-center justify-start">
                <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Filter Status</div>
                <UIcon name="i-tabler-info-circle" class="text-blue-500 dark:text-blue-400 h-4 w-4 animate-pulse" />
              </div>
            </UTooltip>

            <div class="p-1.5 px-3 rounded-2xl border border-cool-200 dark:border-cool-700 flex gap-4">
              <URadio v-for="method of [
                { value: '-', label: 'Belum Pulang' },
                { value: 'masuk', label: 'Masuk' },
                { value: 'keluar', label: 'Keluar' }
              ]" :key="method.value" v-model="masukKeluar" v-bind="method" />
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 xl:flex-row">
          <!-- tanggal masuk - keluar -->
          <div class="flex gap-0.5 flex-col">
            <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Tanggal Registrasi</div>
            <UPopover :popper="{ placement: 'bottom-start' }">
              <UButton icon="i-tabler-calendar-event" :disabled="masukKeluar == '-'" :color="masukKeluar == '-' ? 'gray' : 'primary'">
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
          </div>
  
          <!-- Status Klaim -->
          <div class="flex gap-0.5 flex-col xl:w-[250px]">
            <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Status Klaim</div>
            <USelectMenu v-model="selectedStatus" :options="setStatus" @change="selectedStatus = $event" class="w-full" :searchable="true">
              <template #leading>
                <UIcon v-if="selectedStatus.icon" :name="(selectedStatus.icon as string)" class="w-5 h-5" />
              </template>
            </USelectMenu>
          </div>
        </div>

        <!-- Search field -->
        <div class="w-full md:w-[50%] lg:w-[20%] xl:w-[15%] 2xl:w-[13%]">
          <div class="text-sm text-cool-500 dark:text-cool-400 font-medium">Cari Pasien</div>
          <UInput placeholder="Search..." class="w-full" v-model="bodyReqs.search.value" />
        </div>
      </div>
    </ClientOnly>

    <!-- Table -->
    <UTable :rows="pasienRanap?.data" :columns="pasienRanapColumns" :loading="status == 'pending'">
      <!-- Data -->
      <template #sep.no_sep-data="{ row }">
        <div class="flex flex-col gap-4 w-[310px]">
          <div>
            <div class="flex gap-2 items-center">
              <p class="font-bold truncate text-ellipsis whitespace-nowrap overflow-hidden">{{ row.pasien?.nm_pasien ?? "-" }}</p>
              <template v-if="row.sep_simple?.terkirim_online">
                <UTooltip text="Terkirim Online" :popper="{ placement: 'top' }"
                  :ui="{ background: 'bg-blue-200 dark:bg-blue-900' }">
                  <UIcon name="i-tabler-discount-check-filled" class="text-blue-400 h-5 w-5" />
                </UTooltip>
              </template>
              <template v-else>
                <UTooltip text="Belum Terkirim Online" :popper="{ placement: 'top' }"
                  :ui="{ background: 'bg-rose-200 dark:bg-rose-900' }">
                  <UIcon name="i-tabler-circle-dashed-x" class="text-rose-400 h-5 w-5" />
                </UTooltip>
              </template>
            </div>
            <div class="flex gap-1 mt-1">
              <UBadge size="xs" color="gray">{{ row.pasien?.no_rkm_medis ?? "-" }}</UBadge>
              <span class="text-gray-500 font-semibold text-sm px-1">|</span>
              <span class="text-gray-500 font-semibold text-sm">{{ row.sum_lama }} Hari</span>
              <template v-if="row.sep_simple?.berkas_perawatan">
                <span class="text-gray-500 font-semibold text-sm px-1">|</span>
                <UTooltip text="Berkas Terkirim" :popper="{ placement: 'top' }"
                  :ui="{ background: 'bg-fuchsia-200 dark:bg-fuchsia-900' }">
                  <UBadge size="xs" color="fuchsia" variant="subtle" class="flex items-center gap-1">
                    <UIcon name="i-tabler-checks" class="text-fuchsia-400 h-4.5 w-4.5" />
                    Terkirim
                  </UBadge>
                </UTooltip>
              </template>
            </div>
          </div>

          <div class="flex flex-col gap-1">
            <div class="flex gap-1">
              <UBadge variant="subtle" si color="gray" class="w-fit">
                <p class="truncate text-xs text-ellipsis whitespace-nowrap overflow-hidden">
                  {{ row.reg_periksa_simple?.dokter?.nm_dokter ?? "-" }}
                </p>
              </UBadge>
              <UBadge variant="subtle" si color="purple" class="w-fit">
                <p class="truncate text-xs text-ellipsis whitespace-nowrap overflow-hidden">
                  {{ row.reg_periksa_simple?.poliklinik?.nm_poli ?? "-" }}
                </p>
              </UBadge>
            </div>
            <UBadge :color="row.sep_simple?.no_sep ? 'primary' : 'primary'" variant="soft">
              <div class="flex gap-2 items-center justify-between w-full pl-1">
                {{ row.sep_simple?.no_sep ?? "-" }}
                <template v-if="row.sep_simple?.no_sep && isSupported">
                  <UButton icon="i-tabler-copy" color="primary" variant="soft" size="2xs" @click="copy(row.sep_simple?.no_sep)" />
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
        </div>
      </template>

      <template #status_klaim-data="{ row }">
        <div class="flex flex-row gap-2 items-start">
          <template v-if="row.sep_simple?.status_klaim">
            <UButton @click="setSepRawat(row); openModalKlaimFeedback = true"
              :color="(determineStatus(row.sep_simple?.status_klaim?.status)?.color as any)"
              :variant="(determineStatus(row.sep_simple?.status_klaim?.status)?.variant as any)"
              :icon="(determineStatus(row.sep_simple?.status_klaim?.status)?.icon as any)" size="2xs"
              class="uppercase tracking-wide">
              {{ row.sep_simple?.status_klaim?.status }}
            </UButton>
          </template>
          <template v-else>
            <UButton color="gray" variant="solid" size="2xs" class="uppercase tracking-wide" icon="i-tabler-hash"
              @click="setSepRawat(row); openModalKlaimFeedback = true" :disabled="!row.sep_simple?.no_sep">
              Belum Proses
            </UButton>
          </template>
        </div>
      </template>

      <template #diagnosa-data="{ row }">
        <div class="flex flex-col gap-2">
          <UBadge color="red" variant="soft" class="w-fit">
            <div class="flex gap-2 items-center justify-center">
              {{ row.sep_simple?.diagawal ?? "-" }}
            </div>
          </UBadge>
        </div>
      </template>

      <template #reg_periksa?.tgl_registrasi-data="{ row }">
        <div class="font-semibold">{{ new Date(row.reg_periksa_simple?.tgl_registrasi).toLocaleDateString('id-ID', {
          weekday: 'short', year: 'numeric',
          month: 'short', day: 'numeric'
        }) }}</div>
        <div>{{ row.reg_periksa_simple?.jam_reg }}</div>
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

      <template #patient_cost-data="{ row }">
        <USkeleton class="h-4 w-[100px]" v-if="pendingFetchCost" />
        <template v-if="!pendingFetchCost">
          <div class="flex flex-row gap-4 items-center justify-start">
            <template v-if="getPercentage(gc.find((item: any) => item.no_sep === row.sep_simple?.no_sep)?.tarif ?? 0, rc?.[row.no_rawat]?.total ?? 0) >= 100">
              <UPopover mode="hover">
                <UIcon name="i-tabler-arrow-big-up-line" class="text-red-400 h-5 w-5" />
                <template #panel>
                  <div class="p-3">
                    <p class="font-base"><span class="font-bold">Lebih tinggi</span></p>
                    <p class="font-base">
                      Real cost melebihi batas nominal groupping.
                    </p>
                    <!-- selisih -->
                    <div class="flex flex-row gap-1 items-center justify-start mt-2">
                      <UIcon name="i-tabler-arrow-big-up-line" class="text-red-400 h-5 w-5" />
                      <p class="font-semibold text-red-400">
                      {{
                          new Intl.NumberFormat('id-ID', {
                            style: 'currency',
                            currency: 'IDR',
                            minimumFractionDigits: 0
                          }).format((gc.find((item: any) => item.no_sep === row.sep_simple?.no_sep)?.tarif ?? 0) - (rc?.[row.no_rawat]?.total ?? 0))
                        }}
                      </p>
                  </div>
                  </div>
                </template>
              </UPopover>
            </template>

            <template v-if="getPercentage(gc.find((item: any) => item.no_sep === row.sep_simple?.no_sep)?.tarif ?? 0, rc?.[row.no_rawat]?.total ?? 0) >= 80 && getPercentage(gc.find((item: any) => item.no_sep === row.sep_simple?.no_sep)?.tarif ?? 0, rc?.[row.no_rawat]?.total ?? 0)  < 100">
              <UPopover mode="hover">
                <UIcon name="i-tabler-triangle" class="text-amber-400 h-5 w-5" />
                <template #panel>
                  <div class="p-3">
                    <p class="font-base"><span class="font-bold">Mendekati</span></p>
                    <p class="font-base">
                      Real cost mendekati batas nominal groupping.
                    </p>
                  </div>
                </template>
              </UPopover>
            </template>

            <template v-else-if="getPercentage(gc.find((item: any) => item.no_sep === row.sep_simple?.no_sep)?.tarif ?? 0, rc?.[row.no_rawat]?.total ?? 0) <= 80">
              <UPopover mode="hover">
                <UIcon name="i-tabler-circle" class="text-emerald-400 h-5 w-5" />
                <template #panel>
                  <div class="p-3">
                    <p class="font-base">
                      <span class="font-bold">Aman</span>
                    </p>
                    <p class="font-base">
                      Masih dalam batas nominal groupping.
                    </p>
                  </div>
                </template>
              </UPopover>
            </template>

            <div class="flex flex-col gap-2">
              <UTooltip text="Real Cost" :popper="{ placement: 'right' }" :ui="{background: 'bg-teal-200 dark:bg-teal-900',}">
                <p class="font-semibold text-teal-500 leading-none">{{ new Intl.NumberFormat('id-ID', {
                  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                }).format(rc?.[row.no_rawat]?.total ?? 0) }}</p>
              </UTooltip>
              
              <div class="font-semibold leading-none text-violet-400">
                <UTooltip text="Groupping Cost" :popper="{ placement: 'right' }" :ui="{background: 'bg-violet-200 dark:bg-violet-900',}">
                  <p v-if="row.sep">
                    {{
                      gc?.find((item: any) => item.no_sep === row.sep_simple?.no_sep)?.tarif
                        ? new Intl.NumberFormat('id-ID', {
                          style: 'currency',
                          currency: 'IDR',
                          maximumFractionDigits: 0
                        }).format(gc.find((item: any) => item.no_sep === row.sep_simple?.no_sep)?.tarif ?? 0)
                        : '-'
                    }}
                  </p>
        
                  <p v-else>-</p>
                </UTooltip>
              </div>
            </div>
          </div>
        </template>
      </template>

      <template #action-data="{ row }">
        <div class="flex gap-1">
          <UButton 
            :disabled="!row.sep_simple?.no_sep" 
            :to="`/klaim/${row.sep_simple?.no_sep}`"
            :variant="!row.sep_simple?.no_sep ? 'solid' : 'soft'" 
            :color="!row.sep_simple?.no_sep ? 'gray' : 'primary'" 
            icon="i-tabler-external-link"
            target="_blank" 
            size="xs"
          >
            Form Klaim
          </UButton>

          <UDropdown :items="[
            [{
              label: 'Riawayat Klaim',
              icon: 'i-tabler-pig-money',
              disabled: !row?.pasien?.no_rkm_medis,
              click: () => {
                openNewTab(buildUrl(row.pasien?.no_rkm_medis));
              }
            }, {
              // berkas
              label: 'Berkas Klaim',
              icon: 'i-tabler-file-text',
              disabled: !row.sep_simple?.no_sep,
              click: () => {
                pdfReady = false;
                openDokumen = true;
                sep = row.sep_simple?.no_sep
              }
            }],
            [{
              label: 'CPPT',
              icon: 'i-tabler-file-text',
              disabled: !row.no_rawat || !row.pasien?.no_rkm_medis,
              click: () => {
                setSepRawat(row)
                openModalCPPT = true
              }
            }],
            [{
              icon: 'i-tabler-note',
              label: 'Status & Note',
              disabled: !row.sep_simple?.no_sep,
              click: () => {
                setSepRawat(row)
                openModalKlaimFeedback = true
              }
            }], [{
              label: 'Kirim Berkas',
              icon: 'i-tabler-file-export',
              disabled: !row.sep_simple?.no_sep,
              click: () => {
                setSepRawat(row)
                openModalLoading = true
                doExportBerkas()
              }
            }]
          ]">
            <UButton 
              size="xs" 
              :disable="false" 
              :variant="!row.sep_simple?.no_sep ? 'solid' : 'soft'" 
              :color="!row.sep_simple?.no_sep ? 'gray' : 'primary'" 
              trailing-icon="i-heroicons-chevron-down-20-solid"
            />
          </UDropdown>
        </div>
      </template>

      <!-- Header -->
      <template #patient_cost-header="{ column }">
        <span class="text-teal-500 bg-teal-100/70 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500 dark:border whitespace-nowrap rounded-md px-2 py-1">
          {{ column.label }}
        </span>
      </template>

      <template #tgl_keluar-header="{ column }">
        <span class="whitespace-nowrap">
          {{ column.label }}
        </span>
      </template>
    </UTable>

    <!-- pagination -->
    <div v-if="pasienRanap && pasienRanap?.meta">
      <div class="mt-5 flex flex-col md:flex-row items-center justify-between">
        <p class="text-sm text-gray-500 dark:text-gray-400">
          Showing : {{ (pasienRanap?.meta as any)?.from }}
          to {{ (pasienRanap?.meta as any)?.to }}
          of {{ (pasienRanap?.meta as any)?.total }} entries
        </p>
        <UPagination 
          v-model="currentPage" 
          :total="(pasienRanap?.meta as any)?.total" 
          :page-count="(pasienRanap?.meta as any)?.per_page"
        />
      </div>
    </div>
  </UCard>

  <USlideover v-model="openDokumen" :ui="{ width: 'w-screen max-w-[50%]' }">
    <div class="p-4 flex-1">
      <UButton color="gray" variant="ghost" size="sm" icon="i-heroicons-x-mark-20-solid"
        class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="openDokumen = false" />
      <div v-if="!pdfReady"
        class="absolute inset-0 flex justify-center items-center bg-gray-100 z-10 bg-gray-200/50 dark:bg-gray-800/50">
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

  <template v-if="sep">
    <ModalKlaimFeedback v-model:isOpen="openModalKlaimFeedback" :sep="sep" :noRawat="noRawat" :callback="refresh" />
  </template>
  <!-- Modal Loading -->
  <ModalLoading v-model:isOpen="openModalLoading" />
  <!-- Modal CPPT -->
  <ModalCppt v-model:isOpen="openModalCPPT" :noRekamMedis="noRekamMedis" :noRawat="noRawat" statusLanjut="ranap" />
</template>

<script lang="ts" setup>
import type { GroupingCostRawatInap, OrionFilterInterface, RealCostRawatInap, ResourcePagination } from '~/types'
import { pasienRanapColumns } from '~/common/data/columns'
import { useClipboard, useDebounceFn } from '@vueuse/core'
import { format } from 'date-fns'
import { determineStatus } from '~/common/helpers/statusHelper';
import { setStatus } from '~/common/helpers/statusHelper';

const buildUrl = (noRawat: string) => `/sep/${btoa(noRawat)}`

const sep = ref('')
const pdfUrl = ref('')
const noRawat = ref('')
const toast = useToast()
const pdfReady = ref(false)
const noRekamMedis = ref('')
const statusTerkirim = ref('')
const openDokumen = ref(false)
const openModalCPPT = ref(false)
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const openModalLoading = ref(false);
const openModalKlaimFeedback = ref(false);
const selectedStatus = ref(setStatus[0])

const props = defineProps<{
  query: any
}>()

// Watch for SEP changes and update PDF URL
watch(sep, (val) => {
  if (val) {
    pdfUrl.value = `${config.public.API_V2_URL}/sep/${val}/print?token=${tokenStore.accessToken}`
  }
})

const doExportBerkas = async () => {
  try {
    await fetch(`${config.public.API_V2_URL}/sep/${sep.value}/export`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenStore.accessToken}`
      }
    })
  } catch (error) {
    console.error('Failed to Kirim Berkas', error)
  } finally {
    openModalLoading.value = false
    refresh()
  }
}

const setSepRawat = (row: any) => {
  sep.value = row.sep_simple?.no_sep
  noRawat.value = row?.no_rawat
  noRekamMedis.value = row?.pasien?.no_rkm_medis
}

const openNewTab = (url: string) => {
  window.open(url, '_blank')
}

const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })

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
const bodyReqs = ref<{
  scopes: { name: string; parameters?: any[] }[];
  filters: { field: string; operator: string; value: any }[];
  sort: { field: string; direction: string }[];
  search: { value: string };
  includes?: { relation: string }[];
}>({
  scopes: [],
  filters: [
    { field: 'stts_pulang', operator: '=', value: '-' },
    { field: 'regPeriksa.kd_pj', operator: 'in', value: ['A01', 'A05'] }
  ],
  sort: [{ field: 'no_rawat', direction: 'desc' }],
  search: { value: '' },
  includes: [
    { "relation": "regPeriksaSimple" },
    { "relation": "regPeriksaSimple.dokter" },
    { "relation": "regPeriksaSimple.poliklinik" },

    { "relation": "sepSimple" },
    { "relation": "sepSimple.status_klaim" },
    { "relation": "sepSimple.terkirim_online" },
    { "relation": "sepSimple.berkasPerawatan" }
  ]
})

// status on query url
if (props?.query?.status) {
  bodyReqs.value.filters.push({ field: 'sep.status_klaim.status', operator: '=', value: props.query.status })
  selectedStatus.value = setStatus.find((item) => item.id === props.query.status) ?? setStatus[0]
}

// date on query url
if (props?.query?.month) {
  // props?.query?.month is YYYY-MM get start and end date (1 - 29/30/31) from it
  const [year, month] = props?.query?.month.split('-').map(Number)
  date.value.start = new Date(year, month - 1, 1)
  date.value.end = new Date(year, month, 0)

  // if date is valid 
  if (date.value.start.toString() !== 'Invalid Date' && date.value.end.toString() !== 'Invalid Date') {
    masukKeluar.value = 'keluar'
    bodyReqs.value.filters = bodyReqs.value.filters.filter((item: any) => item.field !== 'stts_pulang')

    updateFilters()
  }
}

// if terkirim on query url
if (props?.query?.terkirim) {
  statusTerkirim.value = 'terkirim'
  masukKeluar.value = 'masuk'
  
  if (!bodyReqs.value.scopes.some((s: any) => s.name === 'hasBerkasPerawatan')) {
    bodyReqs.value.scopes.push({ name: 'hasBerkasPerawatan' })
  }

  updateFilters()
}

// Update filters based on the selected options
function updateFilters() {
  bodyReqs.value.sort = []
  bodyReqs.value.filters = []

  const { search, filters } = bodyReqs.value

  if (search.value) {
    filters.push({ field: 'stts_pulang', operator: '!=', value: 'Pindah Kamar' })
    currentPage.value = 1
  }

  const dateFilter = masukKeluar.value === 'masuk'
    ? 'regPeriksa.tgl_registrasi'
    : 'tgl_keluar'

  if (masukKeluar.value == '-') {
    bodyReqs.value.sort = [{ field: 'no_rawat', direction: 'desc' }]
    filters.push({ field: 'stts_pulang', operator: '=', value: '-' })
  } else if (masukKeluar.value == 'masuk') {
    bodyReqs.value.sort = [{ field: 'regPeriksa.tgl_registrasi', direction: 'desc' }]
    filters.push({ field: 'stts_pulang', operator: '!=', value: 'Pindah Kamar' })
  } else {
    bodyReqs.value.sort = [{ field: 'tgl_keluar', direction: 'desc' }]
    filters.push({ field: 'stts_pulang', operator: '!=', value: 'Pindah Kamar' })
  }

  if (masukKeluar.value !== '-') {
    filters.push({ field: dateFilter, operator: '>=', value: format(date.value.start, 'yyyy-MM-dd') })
    filters.push({ field: dateFilter, operator: '<=', value: format(date.value.end, 'yyyy-MM-dd') })
  }

  // set status filter
  if (selectedStatus.value.id) {
    bodyReqs.value.scopes = bodyReqs.value.scopes.filter((s: any) => s.name !== 'notHasStatusKlaim')

    if (selectedStatus.value.id == "") {
      bodyReqs.value.filters = bodyReqs.value.filters.filter((f: OrionFilterInterface) => f.field != 'sep.status_klaim.status')
    } else if (selectedStatus.value.id == "belum") {
      if (!bodyReqs.value.scopes.some((s: any) => s.name === 'notHasStatusKlaim')) {
        bodyReqs.value.scopes.push({ name: 'notHasStatusKlaim' })
      }
    } else {
      bodyReqs.value.filters = bodyReqs.value.filters.filter((f: OrionFilterInterface) => f.field != 'sep.status_klaim.status')
      bodyReqs.value.filters = [
        ...bodyReqs.value.filters,
        { field: 'sep.status_klaim.status', operator: '=', value: selectedStatus.value.id }
      ]
    }
  }

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
  showedNoSep.value = pasienRanap.value?.data.map((item: any) => item.sep_simple?.no_sep).filter(Boolean) ?? []
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

watch(pasienRanap, updateShowedData)
watch([showedNoRawat, showedNoSep], fetchData, { immediate: true })
watch(statusTerkirim, (val) => {
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
});

watch([date, masukKeluar, selectedStatus, bodyReqs.value.search, statusTerkirim], useDebounceFn(async () => {
  status.value = 'pending'
  pasienRanap.value = null
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
