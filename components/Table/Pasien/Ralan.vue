<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'
import { determineStatus } from '~/common/helpers/statusHelper';

const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const sep = ref('')
const noRawat = ref('')
const pdfUrl = ref('')

const pdfReady = ref(false)
const openDokumen = ref(false)
const openModalLoading = ref(false);
const openModalKlaimFeedback = ref(false);

const buildUrl = (noRawat: string) => `/sep/${btoa(noRawat)}`
const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })

const setSepRawat = (row: any) => {
  sep.value = row?.no_sep
  noRawat.value = row?.no_rawat
}

const props = defineProps({
  data: Object,
  error: Object,
  refresh: Function,
  status: String,

  costStatus: String,
  realCostData: Object,
  grouppingCostData: Object,
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
  }
}

watch(() => props.grouppingCostData, () => {
  console.log('grouppingCostData ---', props.grouppingCostData)
})

watch(sep, (val) => {
  if (val) {
    pdfUrl.value = `${config.public.API_V2_URL}/sep/${val}/print?token=${tokenStore.accessToken}`
  }
})

const openNewTab = (url: string) => {
  window.open(url, '_blank')
}
</script>

<template>

  <UTable :rows="(data as any).data" :loading="props.status == 'pending'" :columns="[
    { label: 'No. SEP', key: 'no_sep' },
    // { label: 'Pasien', key: 'pasien?.nm_pasien' },
    { label: 'Status', key: 'status_klaim' },
    { label: 'Diagnosa', key: 'diagawal' },
    { label: 'DPJP', key: 'nmdpdjp' },
    { label: 'Tgl Periksa', key: 'reg_periksa?.tgl_registrasi' },
    { label: 'Real Cost', key: 'real_cost' },
    { label: 'Groupping', key: 'groupping_cost' },
    { label: 'Action', key: 'action' },
  ]">
    <template #action-data="{ row }">
      <div class="flex gap-2">
        <UButton :disabled="!row.no_sep" :to="`/klaim/${row?.no_sep}`" icon="i-tabler-external-link"
          :variant="!row.no_sep ? 'solid' : 'soft'" :color="!row.no_sep ? 'gray' : 'sky'" target="_blank" size="sm"
          square>
          Data Klaim
        </UButton>

        <UDropdown :items="[
          [{
            label: 'Riawayat Klaim',
            icon: 'i-tabler-pig-money',
            click: () => {
              openNewTab(buildUrl(row.pasien.no_rkm_medis));
            }
          }, {
            // berkas
            label: 'Berkas Klaim',
            icon: 'i-tabler-file-text',
            click: () => {
              openDokumen = true;
              pdfReady = false;
              sep = row?.no_sep
            }
          }],
          [{
            label: 'Status & Note',
            icon: 'i-tabler-note',
            click: () => {
              setSepRawat(row)
              openModalKlaimFeedback = true
            }
          }], [{
            label: 'Kirim Berkas',
            icon: 'i-tabler-file-export',
            click: () => {
              setSepRawat(row)
              openModalLoading = true
              doExportBerkas()
            }
          }]
        ]">
          <UButton square variant="soft" size="sm" color="sky" trailing-icon="i-heroicons-chevron-down-20-solid" />
        </UDropdown>
      </div>
    </template>

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

    <template #groupping_cost-header="{ column }">
      <span
        class="text-violet-500 bg-violet-100/70 dark:text-violet-400 dark:bg-violet-500/20 dark:border-violet-500 dark:border whitespace-nowrap rounded-md px-2 py-1">
        {{ column.label }}
      </span>
    </template>


    <!-- realcost data -->
    <template #real_cost-data="{ row }">
      <template v-if="costStatus == 'success'">
        <span class="font-semibold text-teal-500">{{ new Intl.NumberFormat('id-ID', {
          style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(props.realCostData?.[row.no_rawat]?.total ?? 0) }}</span>
      </template>
      <template v-else-if="costStatus == 'loading'">
        <div class="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded-md"></div>
      </template>
      <template v-else-if="costStatus == 'error'">
        <span class="text-red-500">Failed to fetch</span>
      </template>
      <template v-else>
        <span class="text-gray-500">-</span>
      </template>
    </template>

    <template #groupping_cost-data="{ row }">
      <template v-if="costStatus == 'success'">
        <span class="font-semibold text-indigo-500">{{
          new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
          }).format(props.grouppingCostData?.find((item: any) => item.no_sep === row.no_sep)?.tarif ?? 0)
        }}</span>
      </template>
      <template v-else-if="costStatus == 'loading'">
        <div class="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded-md"></div>
      </template>
      <template v-else-if="costStatus == 'error'">
        <span class="text-red-500">Failed to fetch</span>
      </template>
      <template v-else>
        <span class="text-gray-500">-</span>
      </template>
    </template>

    <template #status_klaim-data="{ row }">
      <div class="flex flex-row gap-2 items-start">
        <template v-if="row.status_klaim">
          <UButton :color="(determineStatus(row.status_klaim?.status)?.color as any)"
            :variant="(determineStatus(row.status_klaim?.status)?.variant as any)"
            :icon="(determineStatus(row.status_klaim?.status)?.icon as any)" size="2xs"
            class="uppercase tracking-wide">
            {{ row.status_klaim?.status }}
          </UButton>
        </template>
        <template v-else>
          <UButton color="gray" variant="solid" size="2xs" class="uppercase tracking-wide" icon="i-tabler-hash">
            Belum Proses
          </UButton>
        </template>
      </div>
    </template>

    <template #no_sep-data="{ row }">
      <div class="flex flex-col gap-4 w-[310px]">
        <div>
          <p class="font-bold truncate text-ellipsis whitespace-nowrap overflow-hidden">{{ row.pasien?.nm_pasien ?? "-"
            }}</p>
          <div class="flex gap-1 mt-1">
            <UBadge size="xs" color="gray">{{ row.pasien?.no_rkm_medis ?? "-" }}</UBadge>
            <template v-if="row?.berkas_perawatan">
              <span class="text-gray-500 font-semibold text-sm px-1">|</span>
              <UTooltip text="Berkas Terkirim" :popper="{ placement: 'top' }">
                <UBadge size="xs" color="fuchsia" variant="subtle" class="flex items-center gap-1">
                  <UIcon name="i-tabler-checks" class="text-fuchsia-400 h-4.5 w-4.5" />
                  Terkirim
                </UBadge>
              </UTooltip>
            </template>
          </div>
        </div>

        <div class="flex flex-col gap-1">
          <UBadge :color="row.no_sep ? 'primary' : 'primary'" variant="soft">
            <div class="flex gap-2 items-center justify-between w-full pl-1">
              {{ row.no_sep ?? "-" }}
              <template v-if="row.no_sep && isSupported">
                <UButton icon="i-tabler-copy" color="primary" variant="soft" size="2xs" @click="copy(row.no_sep)" />
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

    <template #diagawal-data="{ row }">
      <UBadge color="red" variant="soft">
        <div class="flex gap-2 items-center justify-center">
          {{ row.diagawal }}
        </div>
      </UBadge>
    </template>

    <template #pasien?.nm_pasien-data="{ row }">
      <span class="font-bold">{{ row.pasien?.nm_pasien ?? "-" }}</span>
      <div class="flex gap-1 mt-1">
        <UBadge size="xs" color="gray">{{ row.pasien?.no_rkm_medis ?? "-" }}</UBadge>
        <span class="text-gray-500 font-semibold text-sm px-1">|</span>

        <UTooltip>
          <div class="flex gap-1">
            <span class="dark:text-gray-400/80 text-gray-500 font-semibold text-sm">{{ row.reg_periksa?.umurdaftar
              }}</span>
            <span class="dark:text-gray-400/80 text-gray-500 font-semibold text-sm">{{ row.reg_periksa?.sttsumur
              }}</span>
          </div>

          <template #text>
            <span class="text-amber-400 dark:text-amber-600 font-semibold">Umur pasien ketika daftar</span>
          </template>
        </UTooltip>
      </div>
    </template>

    <template #nmdpdjp-data="{ row }">
      <span class="font-semibold">{{ row?.reg_periksa?.dokter?.nm_dokter }}</span>
    </template>

    <template #reg_periksa?.tgl_registrasi-data="{ row }">
      <div class="font-semibold">{{ new Date(row.reg_periksa?.tgl_registrasi).toLocaleDateString('id-ID', {
        weekday: 'short', year: 'numeric',
        month: 'short', day: 'numeric'
      }) }}</div>
      <div>{{ row.reg_periksa?.jam_reg }}</div>
    </template>
  </UTable>


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

  <!-- Modal Klaim Feedback -->
  <ModalKlaimFeedback v-model:isOpen="openModalKlaimFeedback" :sep="sep" :noRawat="noRawat" />
  <!-- Modal Loading -->
  <ModalLoading v-model:isOpen="openModalLoading" />
</template>
