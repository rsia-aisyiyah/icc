<template>
  <TableDataSep :data="data" />
</template>

<script lang="ts" setup>
const route = useRoute();
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const currentPage = ref(1)
const no_rawat = ref(atob(route.params.no_rawat));

const { data, pending, error, refresh } = await useFetch(`${config.public.API_V2_URL}/sep/search`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  },
  body: JSON.stringify({
    "sort": [
      {
        "field": "no_rawat",
        "direction": "desc"
      }
    ],
    "filters": [
      { "field": "no_rawat", "operator": "=", "value": no_rawat }
    ]
  })
})
</script>