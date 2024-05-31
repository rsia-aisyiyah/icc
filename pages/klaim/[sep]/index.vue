<template>
  <UContainer>
    <UCard>
      <FormKlaim 
        :sep="bridgingSep.data"
      />
    </UCard>
  </UContainer>
</template>

<script lang="ts" setup>
import type { ResponseSepData } from '~/types/sep'

const route = useRoute();
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const no_sep = ref(route.params.sep);

const { data: bridgingSep, pending, error, refresh } = await useFetch<ResponseSepData>(`${config.public.API_V2_URL}/sep/${no_sep.value}`, {
  method: 'GET',
  headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
})
</script>