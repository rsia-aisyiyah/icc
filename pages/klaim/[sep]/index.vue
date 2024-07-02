<template>
  <UContainer>
    <UCard>
      <FormKlaim 
        :sep="bridgingSep?.data"
        :regPeriksa="allData.regPeriksa?.data"
        :kamarInap="allData.kamarInap?.data"
      />
    </UCard>
  </UContainer>
</template>

<script lang="ts" setup>
import type { ResponseSepData, SepData } from '~/types/sep'
import type { ResponseRegPeriksa, RegPeriksa } from '~/types/regPeriksa'
import type { KamarInapResponse, KamarInap } from '~/types/kamarInap';

const route = useRoute();
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const no_sep = ref(route.params.sep);

const allData = ref<{ regPeriksa: ResponseRegPeriksa | null, kamarInap: KamarInapResponse | null }>({
  regPeriksa: null,
  kamarInap: null
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
  console.log("Fetching detail Data");
  const noRawat = bridgingSep?.value?.data.no_rawat || ''

  const { data, pending, error, refresh, status } = await useAsyncData(`data-klaim-pasien-${btoa(noRawat)}`, async () => {
    const [regPeriksa, kamarInap] = await Promise.all([
      // Fetch Reg Periksa
      $fetch<ResponseRegPeriksa>(`${config.public.API_V2_URL}/registrasi/periksa/${btoa(noRawat)}`, {
        query: { include: 'pasienBayi' },
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
      }),

      // Fetch Kamar Inap
      $fetch<KamarInapResponse>(`${config.public.API_V2_URL}/kamar/inap/${btoa(noRawat)}`, {
        headers: { Authorization: `Bearer ${tokenStore.accessToken}` }
      }),
    ])

    return { regPeriksa, kamarInap }
  })  

  if (error.value) {
    console.error(error.value)
  }

  allData.value = data.value as any;
}
</script>