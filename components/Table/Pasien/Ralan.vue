<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'
import { determineStatus } from '~/common/helpers/statusHelper';
import { getPercentage, getDifference } from '~/utils/costCompare'

const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const noRekamMedis = ref('')
const noRawat = ref('')
const pdfUrl = ref('')
const sep = ref('')

const pdfReady = ref(false)
const openDokumen = ref(false)
const openModalCPPT = ref(false)
const localCostStatus = ref('idle')
const openModalLoading = ref(false)
const openModalKlaimFeedback = ref(false)

const buildUrl = (noRawat: string) => `/sep/${btoa(noRawat)}`
const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })

const setSepRawat = (row: any) => {
  sep.value = row?.no_sep
  noRekamMedis.value = row?.pasien?.no_rkm_medis
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

watch(() => props.costStatus, () => {
  (localCostStatus as any).value = props.costStatus
})

const doDeleteBerkas = async () => {
  const confirmDelete = confirm('Apakah anda yakin ingin menghapus pengajuan ini?')

  if (!confirmDelete) {
    openModalLoading.value = false
    return
  }

  try {
    await fetch(`${config.public.API_V2_URL}/sep/${sep.value}/delete`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${tokenStore.accessToken}`
      }
    })
  } catch (error) {
    console.error('Failed to Hapus Berkas', error)
  } finally {
    openModalLoading.value = false
    props.refresh()
  }
}

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
    props.refresh()
  }
}

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

  <UTable :rows="(data as any)?.data" :loading="props.status == 'pending'" :columns="[
    { label: 'No. SEP', key: 'no_sep' },
    // { label: 'Pasien', key: 'pasien?.nm_pasien' },
    { label: 'Status', key: 'status_klaim' },
    { label: 'Diag Awal', key: 'diagawal' },
    { label: 'DPJP', key: 'nmdpdjp' },
    { label: 'Tgl Registrasi', key: 'reg_periksa?.tgl_registrasi' },
    { label: 'Cost Pasien', key: 'patient_cost' },
    // { label: 'Groupping', key: 'groupping_cost' },
    { label: 'Action', key: 'action' },
  ]">
    <template #action-data="{ row }">
      <div class="flex items-start gap-1">
        <UButton :disabled="!row?.no_sep" :to="`/klaim/${row?.no_sep}`" target="_blank" icon="i-tabler-external-link"
          :variant="!row?.no_sep ? 'solid' : 'soft'" :color="!row?.no_sep ? 'gray' : 'sky'" size="xs">
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
            disabled: !row.no_sep,
            click: () => {
              openDokumen = true;
              pdfReady = false;
              sep = row.no_sep
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
            label: 'Status & Note',
            icon: 'i-tabler-note',
            disabled: !row?.no_sep,
            click: () => {
              setSepRawat(row)
              openModalKlaimFeedback = true
            }
          }], [{
            label: 'Kirim Berkas',
            icon: 'i-tabler-file-export',
            disabled: !row?.no_sep,
            click: () => {
              setSepRawat(row)
              openModalLoading = true
              doExportBerkas()
            }
          }, {
              label: 'Hapus Pengajuan',
              icon: 'i-tabler-trash',
              disabled: !row?.no_sep,
              click: () => {
                setSepRawat(row)
                openModalLoading = true
                doDeleteBerkas()
              }
            }]
        ]">
          <UButton size="xs" :disable="false" :variant="!row?.no_sep ? 'solid' : 'soft'"
            :color="!row?.no_sep ? 'gray' : 'sky'" trailing-icon="i-tabler-chevron-down" />
        </UDropdown>
      </div>
    </template>

    <template #patient_cost-header="{ column }">
      <span
        class="text-teal-500 bg-teal-100/70 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500 dark:border whitespace-nowrap rounded-md px-2 py-1">
        {{ column.label }}
      </span>
    </template>


    <!-- realcost data -->
    <template #patient_cost-data="{ row }">
      <template v-if="props.costStatus == 'success'">
        <div class="flex flex-row gap-4 items-center justify-start">
          <template v-if="getPercentage(props.grouppingCostData?.find((item: any) => item.no_sep === row.no_sep)?.tarif ?? 0, props.realCostData?.[row.no_rawat]?.total ?? 0) >= 100">
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
                        }).format((props.grouppingCostData?.find((item: any) => item.no_sep === row.no_sep)?.tarif ?? 0) - (props.realCostData?.[row.no_rawat]?.total ?? 0))
                      }}
                    </p>
                </div>
                </div>
              </template>
            </UPopover>
          </template>

          <template v-if="getPercentage(props.grouppingCostData?.find((item: any) => item.no_sep === row.no_sep)?.tarif ?? 0, props.realCostData?.[row.no_rawat]?.total ?? 0) >= 80 && getPercentage(props.grouppingCostData?.find((item: any) => item.no_sep === row.no_sep)?.tarif ?? 0, props.realCostData?.[row.no_rawat]?.total ?? 0)  < 100">
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

          <template v-else-if="getPercentage(props.grouppingCostData?.find((item: any) => item.no_sep === row.no_sep)?.tarif ?? 0, props.realCostData?.[row.no_rawat]?.total ?? 0) <= 80">
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
              }).format(props.realCostData?.[row.no_rawat]?.total ?? 0) }}</p>
            </UTooltip>

            <UTooltip text="Groupping Cost" :popper="{ placement: 'right' }" :ui="{background: 'bg-violet-200 dark:bg-violet-900',}">
              <p class="font-semibold text-violet-500 leading-none">{{
                new Intl.NumberFormat('id-ID', {
                  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                }).format(props.grouppingCostData?.find((item: any) => item.no_sep === row.no_sep)?.tarif ?? 0)
              }}</p>
            </UTooltip>
          </div>
        </div>
      </template>
      <template v-else-if="props.costStatus == 'loading'">
        <div class="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded-md"></div>
      </template>
      <template v-else-if="props.costStatus == 'error'">
        <p class="text-red-500">Failed to fetch</p>
      </template>
      <template v-else>
        <p class="text-gray-500">-</p>
      </template>
    </template>

    <template #status_klaim-data="{ row }">
      <div class="flex flex-row gap-2 items-start">
        <template v-if="row.status_klaim">
          <UButton @click="setSepRawat(row); openModalKlaimFeedback = true"
            :color="(determineStatus(row.status_klaim?.status)?.color as any)"
            :variant="(determineStatus(row.status_klaim?.status)?.variant as any)"
            :icon="(determineStatus(row.status_klaim?.status)?.icon as any)" size="2xs" class="uppercase tracking-wide">
            {{ row.status_klaim?.status }}
          </UButton>
        </template>
        <template v-else>
          <UButton color="gray" variant="solid" size="2xs" class="uppercase tracking-wide" icon="i-tabler-hash"
            @click="setSepRawat(row); openModalKlaimFeedback = true">
            Belum Proses
          </UButton>
        </template>
      </div>
    </template>

    <template #no_sep-data="{ row }">
      <div class="flex flex-col gap-4 w-[310px]">
        <div>
          <div class="flex gap-2 items-center">
            <p class="font-bold truncate text-ellipsis whitespace-nowrap overflow-hidden">{{ row.pasien?.nm_pasien ?? "-" }}</p>
            <template v-if="row?.terkirim_online">
              <UTooltip text="Terkirim Online" :popper="{ placement: 'top' }" :ui="{ background: 'bg-blue-200 dark:bg-blue-900' }">
                <UIcon name="i-tabler-discount-check-filled" class="text-blue-400 h-5 w-5" />
              </UTooltip>
            </template>
            <template v-else>
              <UTooltip text="Belum Terkirim Online" :popper="{ placement: 'top' }" :ui="{ background: 'bg-rose-200 dark:bg-rose-900' }">
                <UIcon name="i-tabler-circle-dashed-x" class="text-rose-400 h-5 w-5" />
              </UTooltip>
            </template>
          </div>
          <div class="flex gap-1 mt-1">
            <UBadge size="xs" color="gray">{{ row.pasien?.no_rkm_medis ?? "-" }}</UBadge>
            <template v-if="row?.berkas_perawatan">
              <span class="text-gray-500 font-semibold text-sm px-1">|</span>
              <UTooltip text="Berkas Terkirim" :popper="{ placement: 'top' }" :ui="{ background: 'bg-fuchsia-200 dark:bg-fuchsia-900' }">
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
            <span class="dark:text-gray-400/80 text-gray-500 font-semibold text-sm">{{ row.reg_periksa?.umurdaftar }}</span>
            <span class="dark:text-gray-400/80 text-gray-500 font-semibold text-sm">{{ row.reg_periksa?.sttsumur }}</span>
          </div>

          <template #text>
            <span class="text-amber-400 dark:text-amber-600 font-semibold">Umur pasien ketika daftar</span>
          </template>
        </UTooltip>
      </div>
    </template>

    <template #nmdpdjp-data="{ row }">
      <p class="font-semibold">{{ row?.reg_periksa?.dokter?.nm_dokter }}</p>
      <p class="font-normal text-sm mt-1">{{ row?.reg_periksa?.poliklinik?.nm_poli }}</p>
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
      <UButton color="gray" variant="ghost" size="sm" icon="i-tabler-x"
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
  <!-- Modal Loading -->
  <!-- Modal CPPT -->
  <ModalKlaimFeedback v-model:isOpen="openModalKlaimFeedback" :sep="sep" :noRawat="noRawat" />
  <ModalLoading v-model:isOpen="openModalLoading" />
  <ModalCppt v-model:isOpen="openModalCPPT" :noRekamMedis="noRekamMedis" :noRawat="noRawat" statusLanjut="ralan" />
</template>
