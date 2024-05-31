<template>
  <UCard>
    <!-- Header -->
    <template #header>
      <div class="flex items-start gap-4">
        <UButton icon="i-uil-dialpad-alt" variant="soft" square />
        <div>
          <h3 class="text-lg font-semibold">Data SEP</h3>
          <p class="text-sm text-gray-500">Daftar data SEP pasien</p>
        </div>
      </div>
    </template>

    <UTable :rows="props.data.data" :columns="dataSepColumns">
      <!-- Action -->
      <template #action-data="{ row }">
        <UButton :to="`/klaim/${row.no_sep}`" :disabled="!row.no_rawat" icon="i-uil-edit"
          :color="!row.no_rawat ? 'gray' : 'primary'" size="xs">
          Form Kalim
        </UButton>
      </template>

      <template #no_rawat-data="{ row }">
        <UBadge color="sky" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_rawat ?? "-" }}
            <template v-if="row.no_rawat">
              <UButton icon="i-tabler-copy" color="sky" variant="soft" size="2xs"
                @click="isSupported && copy(row.no_rawat)" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #no_kartu-data="{ row }">
        <UBadge color="gray" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_kartu ?? "-" }}
            <template v-if="row.no_kartu">
              <UButton icon="i-tabler-copy" color="ghost" variant="soft" size="2xs"
                @click="isSupported && copy(row.no_kartu)" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #diagawal-data="{ row }">
        <UBadge color="lime" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.diagawal ?? "-" }}
          </div>
        </UBadge>
      </template>

      <template #no_sep-data="{ row }">
        <UBadge :color="row.no_sep ? 'primary' : 'red'" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_sep ?? "-" }}
            <template v-if="row.no_sep">
              <UButton icon="i-tabler-copy" color="primary" variant="soft" size="2xs"
                @click="isSupported && copy(row.no_sep)" />
            </template>
          </div>
        </UBadge>
      </template>

      <template #tglrujukan-data="{ row }">
        {{ new Date(row.tglrujukan).toLocaleDateString('id-ID', {
          weekday: 'short', year: 'numeric',
          month: 'short', day: 'numeric'
        }) }}
      </template>

      <template #tglpulang-data="{ row }">
        {{ new Date(row.tglpulang).toLocaleDateString('id-ID', {
          weekday: 'short', year: 'numeric',
          month: 'short', day: 'numeric'
        }) }}
      </template>
    </UTable>
  </UCard>

  <!-- <UModal v-model="isOpen">
    <div class="p-4">
      <Placeholder class="h-48" />
    </div>
  </UModal> -->
</template>

<script lang="ts" setup>
import { dataSepColumns } from '~/common/data/columns'
import { useClipboard } from '@vueuse/core'

const { text, copy, copied, isSupported } = useClipboard({ source: ref('') })
const toast = useToast()
const isOpen = ref(false)
const props = defineProps({
  data: {
    type: Array as PropType<Record<string, any>[]>,
    required: true
  }
})

watch(copied, (val) => {
  if (val) {
    toast.add({
      icon: 'i-uil-check-circle',
      title: 'Copied!',
      description: 'Text copied to clipboard',
      color: 'lime',
      timeout: 2000
    })
  }
})
</script>