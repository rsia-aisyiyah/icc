<template>
  <TableDataSep :data="data" :refresh="onRefresh" :status="status" />
</template>

<script lang="ts" setup>
const route = useRoute();
const config = useRuntimeConfig()
const tokenStore = useAccessTokenStore()

const toast = useToast()
const currentPage = ref(1)
const rm = ref(atob(route.params.rm as string));

const { data, error, refresh, status } = await useFetch(`${config.public.API_V2_URL}/sep/search`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${tokenStore.accessToken}`
  },
  body: JSON.stringify({
    "sort": [
      { "field": "no_rawat", "direction": "desc" }
    ],
    "filters": [
      { "field": "nomr", "operator": "=", "value": rm.value },
    ],
    "includes": [
      { "relation": "reg_periksa" },
      { "relation": "tanggal_pulang" },
      { "relation": "status_klaim" },
      { "relation": "groupStage" }
    ]
  })
})

if (error.value) {
  console.error(error)
  toast.add({
    icon: 'i-tabler-circle-x',
    title: 'Error!',
    description: error.value.data.message,
    color: 'red',
    timeout: 2000
  })
}

function onRefresh() {
  refresh()
}
</script>