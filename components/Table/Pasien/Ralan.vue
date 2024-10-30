<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'

const props = defineProps({
  data: Object,
  error: Object,
  refresh: Function,
  status: String
})

const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })
</script>

<template>

  <UTable :rows="(data as any).data" :loading="props.status == 'pending'" :columns="[
    { label: 'No. SEP', key: 'no_sep' },
    { label: 'Pasien', key: 'pasien?.nm_pasien' },
    { label: 'Diag Awal', key: 'diagawal' },
    { label: 'DPJP', key: 'nmdpdjp' },
    { label: 'Tgl Registrasi', key: 'reg_periksa?.tgl_registrasi' },
    { label: 'Action', key: 'action' },
  ]">

    <template #no_sep-data="{ row }">
      <div class="flex flex-col gap-1">
        <UBadge :color="row.no_sep ? 'primary' : 'primary'" variant="soft">
          <div class="flex gap-2 items-center justify-between w-full pl-1">
            {{ row.no_sep ?? "-" }}
            <template v-if="row.no_sep && isSupported">
              <UButton icon="i-tabler-copy" color="primary" variant="soft" size="2xs" @click="copy(row.no_sep)" />
            </template>
          </div>
        </UBadge>

        <UBadge color="sky" variant="soft">
          <div class="flex gap-2 items-center justify-between w-full pl-1">
            {{ row.no_rawat ?? "-" }}
            <template v-if="row.no_rawat && isSupported">
              <UButton icon="i-tabler-copy" color="sky" variant="soft" size="2xs" @click="copy(row.no_rawat)" />
            </template>
          </div>
        </UBadge>
      </div>
    </template>

    <template #diagawal-data="{ row }">
      <UBadge color="red" variant="soft">
        <div class="flex gap-2 items-center justify-center">
          {{ row.diagawal }}
        </div>
      </UBadge>
    </template>

    <template #pasien?.nm_pasien-data="{ row }">
      <span class="font-bold">{{ row.pasien?.nm_pasien ?? "-" }}</span>
      <div class="flex gap-1 mt-1">
        <UBadge size="xs" color="gray">{{ row.pasien?.no_rkm_medis ?? "-" }}</UBadge>
        <span class="text-gray-500 font-semibold text-sm px-1">|</span>
      </div>
    </template>

    <template #nmdpdjp-data="{ row }">
      <span class="font-semibold">{{ row.nmdpdjp ?? "-" }}</span>
    </template>

    <template #reg_periksa?.tgl_registrasi-data="{ row }">
      <div class="font-semibold">{{ new Date(row.reg_periksa?.tgl_registrasi).toLocaleDateString('id-ID', {
        weekday: 'short', year: 'numeric',
        month: 'short', day: 'numeric'
      }) }}</div>
      <div>{{ row.reg_periksa?.jam_reg }}</div>
    </template>
  </UTable>
</template>
