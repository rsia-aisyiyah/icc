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
        />
      </ClientOnly>
    </UCard>
  </UContainer>
</template>

<script lang="ts" setup>
import type { ResponseSepData } from '~/types/sep'
import type { ResponseRegPeriksa } from '~/types/regPeriksa'
import type { KamarInapResponse } from '~/types/kamarInap';
import type { BillingPasienResponse } from '~/types/biaya';
import type { ResourcePagination } from '~/types/apiResponse';

const route = useRoute();
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const no_sep = ref(route.params.sep);

const allData = ref<{ regPeriksa: ResponseRegPeriksa | null, kamarInap: KamarInapResponse | null, billing: BillingPasienResponse | null, diagnosa: ResourcePagination | null }>({
  regPeriksa: null,
  kamarInap: null,
  billing: null,
  diagnosa: null,
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

  const { data, pending, error, refresh, status } = await useAsyncData(`data-klaim-pasien-${btoa(noRawat)}`, async () => {
    const [regPeriksa, kamarInap, billing, diagnosa] = await Promise.all([
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
    ])

    return { regPeriksa, kamarInap, billing, diagnosa }
  })

  if (status.value == 'error') {
    console.error(error.value)
  }

  allData.value = data.value as any;
}
</script>