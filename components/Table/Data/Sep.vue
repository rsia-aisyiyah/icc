<template>
  <UCard>
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-start gap-4">
          <UButton icon="i-tabler-dialpad" variant="soft" color="sky" square />
          <div>
            <h3 class="text-lg text-sky-500 font-semibold">Data SEP dan Klaim Pasien</h3>
            <p class="text-sm text-cool-500">Daftar data Surat Eligibilitas Peserta</p>
          </div>
        </div>

        <!-- guide color orange and sky if orange is rawat inap and sky os rawat jalan -->
        <div class="flex gap-2 items-center">
          <UBadge color="orange" class="uppercase">◉ Rawat Inap</UBadge>
          <UBadge color="sky" class="uppercase">◉ Rawat Jalan</UBadge>
        </div>
      </div>
    </template>

    <UTable :rows="(props.data as any).data" :columns="dataSepColumns">
      <!-- Action -->
      <template #action-data="{ row }">
        <div class="flex gap-1.5">
          <UButton square :to="`/klaim/${row.no_sep}`" :disabled="!row.no_rawat" icon="i-tabler-edit-circle" :color="!row.no_rawat ? 'gray' : 'sky'" size="xs" variant="soft">
            Form
          </UButton>

          <UButton square :disabled="!row.no_rawat" icon="i-tabler-file-description" :color="!row.no_rawat ? 'gray' : 'primary'" size="xs" variant="soft" @click="openDokumen = true; pdfReady = false; sep = row.no_sep" />

          <UDropdown :items="[
            [{
              label: 'Status & Note',
              icon: 'i-tabler-note',
              click: () => {
                setSepRawat(row)
                openModalKlaimFeedback = true
              }
            }, {
              label: 'Update Status',
              icon: 'i-tabler-status-change',
              click: () => {
                setSepRawat(row)
                openModalUpdateStatus = true
              }
            }]
          ]">
            <UButton square color="amber" variant="soft" size="xs" :disabled="!row.no_rawat" trailing-icon="i-heroicons-chevron-down-20-solid" />
          </UDropdown>
        </div>
      </template>

      <template #nama_pasien-data="{ row }">
        <div class="flex flex-col gap-1">
          <strong>{{ row.nama_pasien ?? "-" }}</strong>
          <div class="flex gap-2 items-center justify-start">
            <UBadge class="text-xs text-gray-500" color="gray" size="xs">{{ row.nomr ?? "-" }}</UBadge> |
            {{ row.peserta }}
          </div>
          <hr class="leading-none my-0.5">
          <p class="leading-none font-semibold text-rose-400 text-xs">{{ row.nmdiagnosaawal }}</p>
        </div>
      </template>

      <template #status_klaim.status-data="{ row }">
        <UBadge v-if="row.status_klaim?.status" :ui="{ rounded: 'rounded-full' }" color="black" size="xs"
          class="px-2 lowercase">{{ row.status_klaim?.status }}</UBadge>
      </template>

      <template #no_rawat-data="{ row }">
        <UBadge :color="row.jnspelayanan == 1 ? 'orange' : 'sky'" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_rawat ?? "-" }}
            <template v-if="row.no_rawat">
              <UButton icon="i-tabler-copy" :color="row.jnspelayanan == 1 ? 'orange' : 'sky'" variant="soft" size="2xs"
                @click="isSupported && copy(row.no_rawat)" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #no_kartu-data="{ row }">
        <UBadge color="gray" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_kartu ?? "-" }}
            <template v-if="row.no_kartu">
              <UButton icon="i-tabler-copy" variant="soft" size="2xs" @click="isSupported && copy(row.no_kartu)"
                color="black" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #no_sep-data="{ row }">
        <div class="flex flex-col gap-1 w-full max-w-xs">
          <UBadge :color="row.no_sep ? 'primary' : 'red'" variant="soft">
            <div class="flex gap-2 items-center justify-between w-full pl-1">
              {{ row.no_sep ?? "-" }}
              <template v-if="row.no_sep">
                <UButton icon="i-tabler-copy" color="primary" variant="soft" size="2xs"
                  @click="isSupported && copy(row.no_sep)" />
              </template>
            </div>
          </UBadge>

          <UBadge :color="row.jnspelayanan == 1 ? 'orange' : 'sky'" variant="soft">
            <div class="flex gap-2 items-center justify-between w-full pl-1">
              {{ row.no_rawat ?? "-" }}
              <template v-if="row.no_rawat">
                <UButton icon="i-tabler-copy" :color="row.jnspelayanan == 1 ? 'orange' : 'sky'" variant="soft"
                  size="2xs" @click="isSupported && copy(row.no_rawat)" />
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
        <div v-if="row?.tanggal_pulang && (row?.tanggal_pulang?.tgl_keluar != '0000-00-00' || row?.tanggal_pulang?.jam_keluar != '00:00:00')"
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
    </UTable>
  </UCard>


  <!-- Slide Over Dokumen View -->
  <USlideover v-model="openDokumen" :ui="{width: 'w-screen max-w-[50%]'}">
    <div class="p-4 flex-1">
      <UButton
        color="gray"
        variant="ghost"
        size="sm"
        icon="i-heroicons-x-mark-20-solid"
        class="flex sm:hidden absolute end-5 top-5 z-10"
        square padded
        @click="openDokumen = false"
      />
      <div v-if="!pdfReady" class="absolute inset-0 flex justify-center items-center bg-gray-100 z-10">
        <div class="loader">Loading...</div>
      </div>

      <iframe :src="pdfUrl" frameborder="0" width="100%" height="100%" @load="pdfReady = true"></iframe>
    </div>
  </USlideover>

  <!-- Modal Update Status -->
  <ModalUpdateStatus v-model:isOpen="openModalUpdateStatus" :sep="sep" :noRawat="noRawat" />
  <!-- Modal Klaim Feedback -->
  <ModalKlaimFeedback v-model:isOpen="openModalKlaimFeedback" :sep="sep" :noRawat="noRawat" />
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
</script>