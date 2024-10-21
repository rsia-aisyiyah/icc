<template>
  <TableDataSep :data="data" />
</template>

<script lang="ts" setup>
const route = useRoute();
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const currentPage = ref(1)
const rm = ref(atob(route.params.rm as string));

const { data, error } = await useFetch(`${config.public.API_V2_URL}/sep/search`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  },
  body: JSON.stringify({
    "sort": [
      { "field": "no_rawat", "direction": "desc" }
    ],
    "filters": [
      { "field": "nomr", "operator": "=", "value": rm },
    ],
    "includes": [
      { "relation": "reg_periksa" },
      { "relation": "tanggal_pulang" },
      { "relation": "status_klaim" }
    ]
  })
})

if (error.value) {
  console.error('Error fetching data:', error.value.cause)
}
</script>