<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'

const props = defineProps({
  data: Object,
  error: Object,
  refresh: Function,
  status: String,

  costStatus: String,
  realCostData: Object,
  grouppingCostData: Object,
})

const buildUrl = (noRawat: string) => `/sep/${btoa(noRawat)}`
const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })

watch(() => props.grouppingCostData, () => {
  console.log('grouppingCostData ---', props.grouppingCostData)
})
</script>

<template>

  <UTable :rows="(data as any).data" :loading="props.status == 'pending'" :columns="[
    { label: 'No. SEP', key: 'no_sep' },
    { label: 'Pasien', key: 'pasien?.nm_pasien' },
    { label: 'Diag Awal', key: 'diagawal' },
    { label: 'DPJP', key: 'nmdpdjp' },
    { label: 'Tgl Periksa', key: 'reg_periksa?.tgl_registrasi' },
    { label: 'Real Cost', key: 'real_cost' },
    { label: 'Groupping', key: 'groupping_cost' },
    { label: 'Action', key: 'action' },
  ]">
    <template #action-data="{ row }">
      <div class="flex gap-1 flex-col">
        <div>
          <UButton :disabled="!row.no_sep" :to="buildUrl(row.pasien.no_rkm_medis)" icon="i-tabler-external-link"
            :variant="!row.no_sep ? 'solid' : 'soft'" :color="!row.no_sep ? 'gray' : 'primary'" target="_blank"
            size="xs" square>
            Data Klaim
          </UButton>
        </div>
      </div>
    </template>

    <template #real_cost-header="{ column }">
      <span
        class="text-teal-500 bg-teal-100/70 dark:bg-teal-500/20 dark:text-teal-400 dark:border-teal-500 dark:border whitespace-nowrap rounded-md px-2 py-1">
        {{ column.label }}
      </span>
    </template>

    <template #mining_tarif-header="{ column }">
      <span
        class="text-indigo-500 bg-indigo-100/70 dark:text-indigo-400 dark:bg-indigo-500/20 dark:border-indigo-500 dark:border whitespace-nowrap rounded-md px-2 py-1">
        {{ column.label }}
      </span>
    </template>

    <template #groupping_cost-header="{ column }">
      <span
        class="text-violet-500 bg-violet-100/70 dark:text-violet-400 dark:bg-violet-500/20 dark:border-violet-500 dark:border whitespace-nowrap rounded-md px-2 py-1">
        {{ column.label }}
      </span>
    </template>


    <!-- realcost data -->
    <template #real_cost-data="{ row }">
      <template v-if="costStatus == 'success'">
        <span class="font-semibold text-teal-500">{{ new Intl.NumberFormat('id-ID', {
          style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(props.realCostData?.[row.no_rawat]?.total ?? 0) }}</span>
      </template>
      <template v-else-if="costStatus == 'loading'">
        <div class="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded-md"></div>
      </template>
      <template v-else-if="costStatus == 'error'">
        <span class="text-red-500">Failed to fetch</span>
      </template>
      <template v-else>
        <span class="text-gray-500">-</span>
      </template>
    </template>

    <template #groupping_cost-data="{ row }">
      <template v-if="costStatus == 'success'">
        <span class="font-semibold text-indigo-500">{{
          new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
          }).format(props.grouppingCostData?.find((item: any) => item.no_sep === row.no_sep)?.tarif ?? 0)
        }}</span>
      </template>
      <template v-else-if="costStatus == 'loading'">
        <div class="animate-pulse bg-gray-200 dark:bg-gray-700 h-4 w-24 rounded-md"></div>
      </template>
      <template v-else-if="costStatus == 'error'">
        <span class="text-red-500">Failed to fetch</span>
      </template>
      <template v-else>
        <span class="text-gray-500">-</span>
      </template>
    </template>


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

        <UTooltip>
          <div class="flex gap-1">
            <span class="dark:text-gray-400/80 text-gray-500 font-semibold text-sm">{{ row.reg_periksa?.umurdaftar
              }}</span>
            <span class="dark:text-gray-400/80 text-gray-500 font-semibold text-sm">{{ row.reg_periksa?.sttsumur
              }}</span>
          </div>

          <template #text>
            <span class="text-amber-400 dark:text-amber-600 font-semibold">Umur pasien ketika daftar</span>
          </template>
        </UTooltip>
      </div>
    </template>

    <template #nmdpdjp-data="{ row }">
      <span class="font-semibold">{{ row?.reg_periksa?.dokter?.nm_dokter }}</span>
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
