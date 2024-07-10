<template>
  <TableDataSep :data="data" />
</template>

<script lang="ts" setup>
const route = useRoute();
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const currentPage = ref(1)
const rm = ref(atob(route.params.rm as string));

const { data, pending, error, refresh } = await useFetch(`${config.public.API_V2_URL}/sep/search`, {
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
    ]
  })
})

if (error) {
  console.error('Error fetching data:', error.value)
}
</script>