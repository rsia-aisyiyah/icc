<template>
  <UContainer class="p-0">
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
</template>
<script lang="ts" setup>
import type { ResponseSepData, ResponseTensi, ResponseRegPeriksa, KamarInapResponse, BillingPasienResponse, ResourcePagination } from '~/types';

const route = useRoute();
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const no_sep = ref(route.params.sep);

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
        query: { include: 'pasienBayi' },
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
