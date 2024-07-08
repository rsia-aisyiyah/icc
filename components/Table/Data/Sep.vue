<template>
  <UCard>
    <!-- Header -->
    <template #header>
      <div class="flex items-center justify-between">
        <div class="flex items-start gap-4">
          <UButton icon="i-uil-dialpad-alt" variant="soft" color="sky" square />
          <div>
            <h3 class="text-lg text-sky-500 font-semibold">Data Surat Eligibilitas Peserta (SEP)</h3>
            <p class="text-sm text-cool-500">Daftar data Surat Eligibilitas Peserta</p>
          </div>
        </div>

        <!-- guide color orange and sky if orange is rawat inap and sky os rawat jalan -->
        <div class="flex gap-2 items-center">
          <UBadge color="orange" class="uppercase">◉ Rawat Inap</UBadge>
          <UBadge color="sky" class="uppercase">◉ Rawat Jalan</UBadge>
        </div>
      </div>
    </template>

    <UTable :rows="(props.data as any).data" :columns="dataSepColumns">
      <!-- Action -->
      <template #action-data="{ row }">
        <UButton :to="`/klaim/${row.no_sep}`" :disabled="!row.no_rawat" icon="i-uil-edit"
          :color="!row.no_rawat ? 'gray' : 'primary'" size="xs">
          Form Kalim
        </UButton>
      </template>

      <template #nama_pasien-data="{ row }">
        <div class="flex flex-col gap-1">
          <strong>{{ row.nama_pasien ?? "-" }}</strong>
          <div class="flex gap-2 items-center">
            <UBadge class="text-xs text-gray-500" color="gray" size="xs">{{ row.nomr ?? "-" }}</UBadge>
          </div>
        </div>
      </template>

      <template #no_rawat-data="{ row }">
        <UBadge :color="row.jnspelayanan == 1 ? 'orange' : 'sky'" variant="soft">
          <div class="flex gap-2 items-center justify-center pl-1">
            {{ row.no_rawat ?? "-" }}
            <template v-if="row.no_rawat">
              <UButton icon="i-tabler-copy" :color="row.jnspelayanan == 1 ? '' : 'sky'" variant="soft" size="2xs"
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
        <UBadge color="red" variant="soft">
          <div class="flex gap-2 items-center justify-center">
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
        {{ row.tglpulang && !row.tglpulang.includes('0000-00-00') ? new Date(row.tglpulang).toLocaleDateString('id-ID',
          {
            weekday: 'short', year: 'numeric',
            month: 'short', day: 'numeric'
          }) : '-' }}
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
    required: true,
    type: Object as PropType<any>
  }
})

watch(copied, (val) => {
  if (val) {
    toast.add({
      icon: 'i-uil-check-circle',
      title: 'Copied!',
      description: 'Text copied to clipboard',
      color: 'sky',
      timeout: 2000
    })
  }
})
</script>