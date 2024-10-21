<template>
  <UContainer class="p-0">

    <div class="flex justify-between items-center mb-5">
      <h1 class="text-2xl font-semibold text-primary-500">Form Klaim</h1>
      <div class="flex items-center space-x-2">
        <UButton
          color="primary"
          variant="soft"
          size="sm"
          icon="i-heroicons-document-text-20-solid"
          @click="openDokumen = true; pdfReady = false"
        >
          Berkas Klaim
        </UButton>
      </div>
    </div>

    <UCard>
      <ClientOnly fallback="Loading Forms . . .">
        <FormKlaimNew
          :sep="bridgingSep?.data" 
          :regPeriksa="allData.regPeriksa?.data"
          :kamarInap="allData.kamarInap?.data"
          :billing="allData.billing?.data" 
          :diagnosa="allData.diagnosa?.data"
          :prosedur="allData.prosedur?.data"
          :tensi="allData.sisDiastole?.data"
        />
        <!-- <FormKlaim :sep="bridgingSep?.data" :regPeriksa="allData.regPeriksa?.data" :kamarInap="allData.kamarInap?.data"
          :billing="allData.billing?.data" :diagnosa="allData.diagnosa?.data" :tensi="allData.sisDiastole?.data" /> -->
      </ClientOnly>
    </UCard>
  </UContainer>

  <USlideover v-model="openDokumen" :ui="{width: 'w-screen max-w-[50%]'}">
    <div class="p-4 flex-1">
      <UButton
        color="gray"
        variant="ghost"
        size="sm"
        icon="i-heroicons-x-mark-20-solid"
        class="flex sm:hidden absolute end-5 top-5 z-10"
        square
        padded
        @click="openDokumen = false"
      />
      <div v-if="!pdfReady" class="absolute inset-0 flex justify-center items-center bg-gray-100 z-10">
        <div class="loader">Loading...</div>
      </div>

      <iframe :src="pdfUrl" frameborder="0" width="100%" height="100%" @load="pdfReady = true"></iframe>
    </div>
  </USlideover>
</template>
<script lang="ts" setup>
import type { ResponseSepData, ResponseTensi, ResponseRegPeriksa, KamarInapResponse, BillingPasienResponse, ResourcePagination } from '~/types';

const route = useRoute();
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const pdfReady = ref(false);
const no_sep = ref(route.params.sep);
const openDokumen = ref(false);
const pdfUrl = `${config.public.API_V2_URL}/sep/${no_sep.value}/print?token=${tokenStore.accessToken}`;

// Fungsi untuk membangun URL tensi
const buildUrlTensi = (noRm: string, noRawat: string, status: number) => {
  if (status != 1 && status != 2) {
    return '';
  }

  let stts = status == 1 ? 'ranap' : 'ralan';
  return `${config.public.API_V2_URL}/pasien/${noRm}/riwayat/${noRawat}/${stts}/get-tensi`;
}

const allData = ref<{ 
  regPeriksa: ResponseRegPeriksa | null, 
  kamarInap: KamarInapResponse | null, 
  billing: BillingPasienResponse | null, 
  diagnosa: ResourcePagination | null, 
  prosedur: ResourcePagination | null, 
  sisDiastole: ResponseTensi | null 
}>({
  regPeriksa: null,
  kamarInap: null,
  billing: null,
  diagnosa: null,
  prosedur: null,
  sisDiastole: null,
})

// Fetch data SEP
const { data: bridgingSep, pending: bridgingSepPending, error: bridgingSepError } = await useFetch<ResponseSepData>(`${config.public.API_V2_URL}/sep/${no_sep.value}`, {
  method: 'GET',
  // query: { include: 'chunk' },
  headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
})

if (bridgingSepError.value) {
  console.error(bridgingSepError.value)
} else if (!bridgingSepPending.value && bridgingSep.value) {
  const noRawat = bridgingSep.value.data.no_rawat || ''
  const noRm = bridgingSep.value.data.nomr || ''
  const statusPasien = bridgingSep.value.data.jnspelayanan || 0

  try {
    // Parallel fetching
    const [regPeriksa, kamarInap, billing, diagnosa, prosedur, sisDiastole] = await Promise.all([
      $fetch<ResponseRegPeriksa>(`${config.public.API_V2_URL}/registrasi/periksa/${btoa(noRawat)}`, {
        query: { include: 'pasienBayi,dokter' },
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
      }),

      $fetch<KamarInapResponse>(`${config.public.API_V2_URL}/kamar/inap/${btoa(noRawat)}`, {
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
      }),

      $fetch<BillingPasienResponse>(`${config.public.API_V2_URL}/pasien/ranap/${btoa(noRawat)}/billing`, {
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
      }),

      $fetch<ResourcePagination>(`${config.public.API_V2_URL}/pasien/diagnosa/search`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
        body: JSON.stringify({
          filters: [{ field: 'no_rawat', operator: '=', value: noRawat }],
          sort: [{ field: 'prioritas', direction: 'asc' }]
        })
      }),

      $fetch<ResourcePagination>(`${config.public.API_V2_URL}/pasien/prosedur/search`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
        body: JSON.stringify({
          filters: [{ field: 'no_rawat', operator: '=', value: noRawat }],
          sort: [{ field: 'prioritas', direction: 'asc' }]
        })
      }),

      $fetch<ResponseTensi>(buildUrlTensi(noRm, btoa(noRawat), statusPasien), {
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
      }),
    ])

    // Assign hasil fetch ke state allData
    allData.value = { regPeriksa, kamarInap, billing, diagnosa, prosedur, sisDiastole }
  } catch (error) {
    console.error('Error during parallel fetching:', error)
  }
}
</script>
