<template>
  <UContainer>
    <UCard>
      <ClientOnly>
        <FormKlaim 
          :sep="bridgingSep?.data" 
          :regPeriksa="allData.regPeriksa?.data" 
          :kamarInap="allData.kamarInap?.data"
          :billing="allData.billing?.data" 
          :diagnosa="allData.diagnosa?.data"
          :tensi="allData.sisDiastole?.data"
        />
      </ClientOnly>
    </UCard>
  </UContainer>
</template>

<script lang="ts" setup>
import type { ResponseSepData } from '~/types/sep'
import type { ResponseTensi } from '~/types/tensi'
import type { ResponseRegPeriksa } from '~/types/regPeriksa'
import type { KamarInapResponse } from '~/types/kamarInap';
import type { BillingPasienResponse } from '~/types/biaya';
import type { ResourcePagination } from '~/types/apiResponse';

const route = useRoute();
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const no_sep = ref(route.params.sep);

const buildUrlTensi = (noRm: string, noRawat: string, status: string) => {  
  if (status != '1' && status != '2') {
    return '';
  } 
  
  let stts = status == '1' ? 'ranap' : 'ralan';
  return `${config.public.API_V2_URL}/pasien/${noRm}/riwayat/${noRawat}/${stts}/get-tensi`;
}

const allData = ref<{ regPeriksa: ResponseRegPeriksa | null, kamarInap: KamarInapResponse | null, billing: BillingPasienResponse | null, diagnosa: ResourcePagination | null, sisDiastole: ResponseTensi | null }>({
  regPeriksa: null,
  kamarInap: null,
  billing: null,
  diagnosa: null,
  sisDiastole: null,
})

const { data: bridgingSep, pending: bridgingSepPending, error: bridgingSepError, refresh: bridgingSepRefresh } = await useFetch<ResponseSepData>(`${config.public.API_V2_URL}/sep/${no_sep.value}`, {
  method: 'GET',
  headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
})

if (bridgingSepError.value) {
  console.error(bridgingSepError.value)
}

// if bridgingSepPending.value = false && bridgingSepError.value = null then fetch regPeriksa using multiple fetch
if (!bridgingSepPending.value && !bridgingSepError.value) {
  const noRawat = bridgingSep?.value?.data.no_rawat || ''
  const noRm = bridgingSep?.value?.data.nomr || ''
  let statusPasien = bridgingSep?.value?.data.jnspelayanan || '0'

  const { data, pending, error, refresh, status } = await useAsyncData(`data-klaim-pasien-${btoa(noRawat)}`, async () => {
    let u = buildUrlTensi(noRm, noRawat, statusPasien);    
    
    const [regPeriksa, kamarInap, billing, diagnosa, sisDiastole] = await Promise.all([
      // Fetch Reg Periksa
      $fetch<ResponseRegPeriksa>(`${config.public.API_V2_URL}/registrasi/periksa/${btoa(noRawat)}`, {
        query: { include: 'pasienBayi' },
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
      }),

      // Fetch Kamar Inap
      $fetch<KamarInapResponse>(`${config.public.API_V2_URL}/kamar/inap/${btoa(noRawat)}`, {
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
      }),

      // Fetch Kamar Inap
      $fetch<BillingPasienResponse>(`${config.public.API_V2_URL}/pasien/ranap/${btoa(noRawat)}/billing`, {
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
      }),

      // fetch diagnosa pasien
      $fetch<ResourcePagination>(`${config.public.API_V2_URL}/pasien/diagnosa/search`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
        body: JSON.stringify({
          "filters": [ { "field": "no_rawat", "operator": "=", "value": noRawat } ],
          "sort": [ { "field": "prioritas", "direction": "asc" } ]
        })
      }),
      
      // TODO : sistole & diastole diambil dari tabel pemeriksaan ranap
      $fetch<ResponseTensi>(buildUrlTensi(noRm, btoa(noRawat), statusPasien), {
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
      }),
    ])

    return { regPeriksa, kamarInap, billing, diagnosa, sisDiastole }
  })

  if (status.value == 'error') {
    console.error(error.value)
  }

  allData.value = data.value as any;
}
</script>