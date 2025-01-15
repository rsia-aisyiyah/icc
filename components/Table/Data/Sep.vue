<template>
  <UCard>
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-start gap-4">
          <UButton icon="i-tabler-moneybag" variant="soft" color="sky" square />
          <div>
            <h3 class="text-lg text-sky-500 font-semibold">Riwayat Klaim Pasien</h3>
            <p class="text-sm text-cool-500">Data riwayat klaim pasien</p>
          </div>
        </div>
      </div>
    </template>

    <div class="p-6 rounded-xl dark:bg-gray-800/75 mb-3 bg-gray-200">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="dark:text-white font-semibold">Nama Pasien</h3>
          <p class="dark:text-gray-300">{{ data?.data[0]?.nama_pasien ?? "-" }}</p>
        </div>
        <div>
          <h3 class="dark:text-white font-semibold">No. Rekam Medis</h3>
          <p class="dark:text-gray-300">{{ data?.data[0]?.nomr ?? "-" }}</p>
        </div>
        <div>
          <h3 class="dark:text-white font-semibold">Kepesertaan</h3>
          <p class="dark:text-gray-300">{{ data?.data[0]?.peserta ?? "-" }}</p>
        </div>
      </div>
    </div>

    <UTable :rows="(props?.data as any)?.data" :columns="dataSepColumns">
      <!------------ Action ------------>
      <template #action-data="{ row }">
        <div class="flex gap-1.5">
          <UButton square :to="`/klaim/${row.no_sep}`" target="_blank" :disabled="!row.no_rawat" icon="i-tabler-edit-circle"
            :color="!row.no_rawat ? 'gray' : 'sky'" size="xs" variant="soft">
            Form Klaim
          </UButton>

          <UDropdown :items="[
            [{
              label: 'Berkas Klaim',
              icon: 'i-tabler-file-description',
              disabled: !row.no_sep,
              click: () => {
                openDokumen = true; 
                pdfReady = false; 
                sep = row.no_sep
              }
            },
            {
              label: 'Sync Data',
              icon: 'i-tabler-refresh',
              disabled: !row.no_sep,
              click: () => {
                syncClaimData(row)
                openModalSync = true
              }
            }],
            [{
              label: 'Status & Note',
              icon: 'i-tabler-note',
              disabled: !row.no_sep,
              click: () => {
                setSepRawat(row)
                openModalKlaimFeedback = true
              }
            }], [{
              label: 'Kirim Berkas',
              icon: 'i-tabler-file-export',
              disabled: !row.no_sep,
              click: () => {
                setSepRawat(row)
                openModalLoading = true
                doExportBerkas()
              }
            }]
          ]">
            <UButton square color="sky" variant="soft" size="xs" trailing-icon="i-tabler-chevron-down" />
          </UDropdown>
        </div>
      </template>

      <!------------ Data ------------>
      <template #nama_pasien-data="{ row }">
        <div class="flex flex-col gap-1">
          <strong>{{ row.nama_pasien ?? "-" }}</strong>
          <div class="flex gap-2 items-center justify-start">
            <UBadge class="text-xs" variant="subtle" color="purple" size="xs">{{ row.nomr ?? "-" }}</UBadge> |
            <UBadge class="text-xs" variant="subtle" :color="row.jnspelayanan == 1 ? 'lime' : 'sky'" size="xs">{{
              row.jnspelayanan == 1 ? "Rawat Inap" : "Rawat Jalan" }}</UBadge> |
            {{ row.peserta }}
          </div>
          <UDivider class="my-1.5" />
          <p class="leading-none font-bold text-rose-400 text-xs">{{ row.nmdiagnosaawal }}</p>
        </div>
      </template>

      <template #status_klaim.status-data="{ row }">
        <UBadge v-if="row.status_klaim?.status" :ui="{ rounded: 'rounded-full' }" color="black" size="xs"
          class="px-2 lowercase">{{ row.status_klaim?.status }}</UBadge>
      </template>

      <template #no_rawat-data="{ row }">
        <UBadge :color="row.jnspelayanan == 1 ? 'lime' : 'sky'" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_rawat ?? "-" }}
            <template v-if="row.no_rawat && isSupported">
              <UButton icon="i-tabler-copy" :color="row.jnspelayanan == 1 ? 'lime' : 'sky'" variant="soft" size="2xs"
                @click="copy(row.no_rawat)" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #jnspelayanan-data="{ row }">
        <UButton square :icon="row.jnspelayanan == 1 ? 'i-tabler-bed' : 'i-tabler-stethoscope'"
          :color="row.jnspelayanan == 1 ? 'lime' : 'sky'" size="xs" variant="soft">
          {{ row.jnspelayanan == 1 ? "Rawat Inap" : "Rawat Jalan" }}
        </UButton>
      </template>

      <template #no_kartu-data="{ row }">
        <UBadge color="gray" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_kartu ?? "-" }}
            <template v-if="row.no_kartu && isSupported">
              <UButton icon="i-tabler-copy" variant="soft" size="2xs" @click="copy(row.no_kartu)" color="black" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #no_sep-data="{ row }">
        <div class="flex flex-col gap-1 w-full max-w-xs">
          <UBadge :color="row.no_sep ? 'primary' : 'red'" variant="soft">
            <div class="flex gap-2 items-center justify-between w-full pl-1">
              {{ row.no_sep ?? "-" }}
              <template v-if="row.no_sep && isSupported">
                <UButton icon="i-tabler-copy" color="primary" variant="soft" size="2xs" @click="copy(row.no_sep)" />
              </template>
            </div>
          </UBadge>

          <UBadge :color="row.jnspelayanan == 1 ? 'lime' : 'sky'" variant="soft">
            <div class="flex gap-2 items-center justify-between w-full pl-1">
              {{ row.no_rawat ?? "-" }}
              <template v-if="row.no_rawat && isSupported">
                <UButton icon="i-tabler-copy" :color="row.jnspelayanan == 1 ? 'lime' : 'sky'" variant="soft" size="2xs"
                  @click="copy(row.no_rawat)" />
              </template>
            </div>
          </UBadge>
        </div>
      </template>

      <template #reg_periksa?.tgl_registrasi-data="{ row }">
        {{ new Date(row.reg_periksa?.tgl_registrasi).toLocaleDateString('id-ID', {
          weekday: 'short', year: 'numeric',
          month: 'short', day: 'numeric'
        }) }}

        <!-- jam reg -->
        <div class="text-xs text-gray-500">
          {{ row.reg_periksa?.jam_reg }} WIB
        </div>
      </template>

      <template #tanggal_pulang-data="{ row }">
        <div
          v-if="row?.tanggal_pulang && (row?.tanggal_pulang?.tgl_keluar != '0000-00-00' || row?.tanggal_pulang?.jam_keluar != '00:00:00')"
          class="flex flex-col gap-1">
          <strong class="font-semibold">{{ new Date(row?.tanggal_pulang?.tgl_keluar).toLocaleDateString('id-ID', {
            weekday: 'short', year: 'numeric',
            month: 'short', day: 'numeric'
          }) }}</strong>
          <div class="text-xs text-gray-500">
            {{ row?.tanggal_pulang?.jam_keluar }} WIB
          </div>
        </div>

        <!-- else -->
        <div v-else>
          -
        </div>
      </template>

      <template #group_stage?.code_cbg-data="{ row }">
        <UBadge variant="soft" size="sm" class="w-min" :color="row.group_stage?.code_cbg?.startsWith('X-') ? 'rose' : 'fuchsia'">
          {{ row.group_stage?.code_cbg }}
        </UBadge>
      </template>

      <template #group_stage?.tarif-data="{ row }">
        <template v-if="row.group_stage">
          <span class="text-violet-400 font-semibold">
            {{ new Intl.NumberFormat('id-ID', {
              style: 'currency', currency: 'IDR', maximumFractionDigits: 0
            }).format(row.group_stage?.tarif) }}
          </span>
        </template>
        <template v-else>
          -
        </template>

      </template>

      <!------------ Header ------------>
      <template #groupping_tarif-header="{ column }">
        <span
          class="text-violet-500 bg-violet-100/70 dark:text-violet-400 dark:bg-violet-500/20 dark:border-violet-500 dark:border whitespace-nowrap rounded-md px-2 py-1">
          {{ column.label }}
        </span>
      </template>
    </UTable>
  </UCard>


  <!-- Slide Over Dokumen View -->
  <USlideover v-model="openDokumen" :ui="{ width: 'w-screen max-w-[50%]' }">
    <div class="p-4 flex-1">
      <UButton color="gray" variant="ghost" size="sm" icon="i-tabler-x"
        class="flex sm:hidden absolute end-5 top-5 z-10" square padded @click="openDokumen = false" />
      <div v-if="!pdfReady" class="absolute inset-0 flex justify-center items-center bg-gray-100 z-10 bg-gray-200/50 dark:bg-gray-800/50">
        <div class="loader">Loading...</div>
      </div>

      <iframe :src="pdfUrl" frameborder="0" width="100%" height="100%" @load="pdfReady = true"></iframe>
    </div>
  </USlideover>

  <!-- Modal Update Status -->
  <ModalUpdateStatus v-model:isOpen="openModalUpdateStatus" :sep="sep" :noRawat="noRawat" />
  <!-- Modal Klaim Feedback -->
  <ModalKlaimFeedback v-model:isOpen="openModalKlaimFeedback" :sep="sep" :noRawat="noRawat" />
  <!-- Modal Loading -->
  <ModalLoading v-model:isOpen="openModalSync" />
</template>

<script lang="ts" setup>
import { dataSepColumns } from '~/common/data/columns'
import { useClipboard } from '@vueuse/core'

const tokenStore = useAccessTokenStore()
const config = useRuntimeConfig()

const openDokumen = ref(false);
const pdfReady = ref(false);
const sep = ref('')
const noRawat = ref('')
const pdfUrl = ref('');
const openModalUpdateStatus = ref(false);
const openModalKlaimFeedback = ref(false);
const openModalSync = ref(false);
const openModalLoading = ref(false);

watch(sep, async (val) => {
  if (val) {
    pdfUrl.value = `${config.public.API_V2_URL}/sep/${val}/print?token=${tokenStore.accessToken}`;
  }
})

const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })
const toast = useToast()
const props = defineProps({
  data: {
    required: true,
    type: Object as PropType<any>
  },

  refresh: {
    type: Function as PropType<() => void>,
    required: true
  },

  status: {
    type: String as PropType<string>,
    required: true
  }
})

const setSepRawat = (row: any) => {
  sep.value = row.no_sep
  noRawat.value = row.no_rawat
}

watch(copied, (val) => {
  if (val) {
    toast.add({
      icon: 'i-tabler-circle-check',
      title: 'Copied!',
      description: 'Text copied to clipboard',
      color: 'sky',
      timeout: 2000
    })
  }
})

const syncClaimData = async (row: any) => {  
  const { data, error, refresh, status } = await useFetch(`${config.public.API_V2_URL}/sep/${row.no_sep}/klaim/sync`,{
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${tokenStore.accessToken}`
    }
  })

  await new Promise(resolve => setTimeout(resolve, 3000))

  if (status.value == 'success') {
    props.refresh()
    openModalSync.value = false

    toast.add({
      icon: 'i-tabler-circle-check',
      title: 'Success!',
      description: 'Data klaim berhasil disinkronisasi',
      color: 'sky',
      timeout: 2000
    })
  } else {
    openModalSync.value = false
    toast.add({
      icon: 'i-tabler-circle-x',
      title: 'Failed!',
      description: 'Data klaim gagal disinkronisasi',
      color: 'rose',
      timeout: 2000
    })
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
  }
}
</script>