<template>
  <TablePasienRanap :query="query" />
</template>

<script lang="ts" setup>
// get query params
import { useRouter } from 'vue-router'
const router = useRouter()
const query = router?.currentRoute?.value?.query
</script>