<template>
  <UModal v-model="localIsOpen" fullscreen>
    <UCard :ui="{
      base: 'h-full flex flex-col',
      rounded: '',
      divide: 'divide-y divide-gray-100 dark:divide-gray-800',
      body: {
        base: 'h-full overflow-hidden',
      }
    }">
      <template #header>
        <div class="flex items-center justify-between">
          <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
            CPPT Pasien ( {{ statusLanjut == 'ralan' ? 'Rawat Jalan' : 'Rawat Inap' }} )
          </h3>
          <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark-20-solid" class="-my-1"
            @click="localIsOpen = false" />
        </div>
      </template>

      <div class="h-full">
        <!-- nama (no_rkm_medis) -->
        <div class="flex items-center justify-between mt-2">
          <div class="flex items-center space-x-3">
            <div class="flex items-center justify-center w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full">
              <UIcon name="i-heroicons-user-20-solid" class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </div>

            <div class="animate-pulse" v-if="pasienStatus == 'pending'">
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-[130px]"></div>
              <div class="h-4 bg-gray-200 dark:bg-gray-700 rounded w-[80px] mt-1"></div>
            </div>
            <div v-if="pasienStatus == 'success'">
              <p class="text-sm font-semibold leading-none dark:text-gray-200">{{ (pasien as any)?.data?.nm_pasien }}
              </p>
              <p class="text-sm font-bold dark:text-white">{{ (pasien as any)?.data?.no_rkm_medis }}
              </p>
            </div>
            <div v-if="pasienStatus == 'error'">
              <p class="text-sm text-red-500 dark:text-red-400">Gagal memuat data pasien</p>
            </div>
          </div>
        </div>

        <!-- loop data.data inside table -->
        <div class="mt-5 max-h-[calc(100%-4rem)] overflow-y-auto">
          <UTable :rows="(cppt as any)?.data" :loading="cpptStatus == 'pending'" :columns="[
            { label: 'Pasien', key: 'pasien' },
            { label: 'Pemeriksaan', key: 'pemeriksaan' },
          ]">
            <template #pasien-data="{ row }">
              <div class="flex flex-col gap-2 items-start">
                <div class="flex gap-1">
                  <UBadge color="indigo" variant="subtle" class="mb-1 font-semibold">{{ row?.no_rawat }}</UBadge>
                  <UBadge color="fuchsia" variant="subtle" class="mb-1 font-semibold">{{ row?.reg_periksa?.sep?.no_sep
                    ?? "---" }}</UBadge>
                </div>

                <div class="flex gap-1">
                  <p class="text-sm text-gray-900 dark:text-gray-200 leading-none">
                    {{ new Date(row?.reg_periksa?.tgl_registrasi).toLocaleDateString('id-ID', {
                      weekday: 'long',
                      year: 'numeric', month: 'short', day: 'numeric'
                    }) }}
                  </p>
                </div>
                <p class="text-sm text-gray-900 dark:text-gray-200 leading-none">{{
                  row?.reg_periksa?.poliklinik?.nm_poli }}</p>

                <hr class="w-full border-t border-gray-200 dark:border-gray-700" />

                <p class="text-sm font-bold text-gray-900 dark:text-gray-200 leading-none">
                  {{ row?.reg_periksa?.dokter?.nm_dokter }}
                </p>

                <div class="mt-5 w-full">
                  <UButton block :loading="syncLoading" :disabled="syncLoading"
                    :color="row?.pemeriksaan_klaim ? 'rose' : 'primary'" variant="solid"
                    :icon="row?.pemeriksaan_klaim ? 'i-tabler-trash' : 'i-tabler-file-text'"
                    @click="row?.pemeriksaan_klaim ? deleteCppt(row?.no_rawat, row?.tgl_perawatan, row?.jam_rawat) : syncCppt(row?.no_rawat, row?.tgl_perawatan, row?.jam_rawat)">
                    {{ row?.pemeriksaan_klaim ? 'Hapus CPPT' : 'Ambil CPPT' }}
                  </UButton>
                </div>
              </div>
            </template>

            <template #pemeriksaan-data="{ row }">
              <div class="flex flex-col gap-2">
                <div class="flex gap-2 items-center">
                  <span class="text-sm text-indigo-600 dark:text-indigo-400 font-bold">Tanggal</span>
                  <span class="text-sm text-indigo-600 dark:text-indigo-400">:</span>
                  <span class="text-sm text-gray-900 dark:text-gray-200">{{ row?.tgl_perawatan }} {{ row?.jam_rawat
                    }}</span>
                </div>

                <hr class="w-full border-t border-gray-200 dark:border-gray-700" />

                <div class="flex gap-2 items-center">
                  <div class="flex gap-1 flex-col items-start justify-around w-full" v-for="item in [
                    { label: 'Suhu(C)', key: 'suhu_tubuh' },
                    { label: 'Tensi(mmHg)', key: 'tensi' },
                    { label: 'Nadi(/menit)', key: 'nadi' },
                    { label: 'RR(/menit)', key: 'respirasi' },
                    { label: 'Tinggi(cm)', key: 'tinggi' },
                    { label: 'Berat(Kg)', key: 'berat' },
                    { label: 'GCS(E,V,M)', key: 'gcs' },
                    { label: 'SPO2', key: 'spo2' },
                    { label: 'Alergi', key: 'alergi' },
                  ]">
                    <span class="text-sm text-indigo-600 dark:text-indigo-400 font-bold">{{ item.label }}</span>
                    <span class="text-sm text-gray-900 dark:text-gray-200">{{ row[item.key] }}</span>
                  </div>
                </div>

                <hr class="w-full border-t border-gray-200 dark:border-gray-700 leading-none" />

                <table class="w-full table-fixed">
                  <tr v-for="item in [
                    { label: 'Kesadaran', key: 'kesadaran' },
                    { label: 'Subyektif', key: 'keluhan' },
                    { label: 'Obyektif', key: 'pemeriksaan' },
                    { label: 'Assesment', key: 'penilaian' },
                    { label: 'Plan', key: 'instruksi' },
                  ]" class="w-full border-b border-gray-200 dark:border-gray-700">
                    <td class="text-sm py-2 leading-4 text-indigo-600 dark:text-indigo-400 font-bold w-[150px]">{{
                      item.label }}</td>
                    <td class="text-sm py-2 leading-4 text-gray-900 dark:text-gray-200 w-full">{{ row[item.key] }}</td>
                  </tr>
                </table>

              </div>
            </template>
          </UTable>
        </div>
      </div>
    </UCard>
  </UModal>
</template>
<script lang="ts" setup>
const props = defineProps({
  isOpen: {
    required: true,
    type: Boolean
  },
  noRekamMedis: {
    required: true,
    type: String
  },
  noRawat: {
    required: true,
    type: String
  },
  statusLanjut: {
    required: true,
    default: 'ralan' as 'ralan' | 'ranap',
    type: String as PropType<'ralan' | 'ranap'>
  }
});

const toast = useToast();
const config = useRuntimeConfig();
const token = useAccessTokenStore();

const syncLoading = ref(false);

// Local state and emits
const localIsOpen = ref(props.isOpen);
const emit = defineEmits(['update:isOpen']);

// Watch changes in localIsOpen and emit updates to parent
watch(localIsOpen, (newValue) => {
  emit('update:isOpen', newValue);
});

// Watch props.isOpen in case the parent updates it directly
watch(() => props.isOpen, (newValue) => {
  localIsOpen.value = newValue;
});

// Watcher to trigger requests when conditions are met
const { data: pasien, error: pasienError, refresh: pasienRefresh, status: pasienStatus } = await useAsyncData(
  `${config.public.API_V2_URL}/pasien/${props.noRekamMedis}`,
  () => $fetch(`${config.public.API_V2_URL}/pasien/${props.noRekamMedis}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }),
  { immediate: true, watch: [() => props.noRekamMedis, () => props.statusLanjut], lazy: true }
);

// Watcher to trigger requests when conditions are met
const { data: cppt, error: cpptError, refresh: cpptRefresh, status: cpptStatus } = await useAsyncData(
  `${config.public.API_V2_URL}/pasien/${props.noRekamMedis}/riwayat/${btoa(props.noRawat)}/${props.statusLanjut}?interval=1`,
  () => $fetch(`${config.public.API_V2_URL}/pasien/${props.noRekamMedis}/riwayat/${btoa(props.noRawat)}/${props.statusLanjut}?interval=1`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }),
  { immediate: true, watch: [() => props.noRekamMedis, () => props.noRawat, () => props.statusLanjut], lazy: true }
);

// Function to add a toaster
const addToaster = (title: string, description: string, color: string, icon: string) => {
  toast.add({ title, description, color, icon, timeout: 3000 });
}

// Function to sync CPPT
const syncCppt = async (noRawat: string, tglPerawatan: string, jamRawat: string) => {
  syncLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 3000));
  const { data, error, refresh, status } = await useAsyncData(
    `${config.public.API_V2_URL}/pasien/riwayat/pemeriksaan/${props.statusLanjut}/sync`,
    () => $fetch(`${config.public.API_V2_URL}/pasien/riwayat/pemeriksaan/${props.statusLanjut}/sync`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ no_rawat: noRawat, tgl_perawatan: tglPerawatan, jam_rawat: jamRawat })
    }),
    { immediate: true, lazy: true }
  );

  syncLoading.value = false;

  if (status.value === 'success') {
    cpptRefresh();
    addToaster('CPPT Synced', 'Data CPPT berhasil disinkronisasi', 'primary', 'i-tabler-check');
  }

  if (status.value === 'error') {
    console.error('Error syncing CPPT:', error.value);
    addToaster('Gagal Sync CPPT', error.value?.data?.message || 'Terjadi kesalahan saat menyinkronisasi CPPT', 'red', 'i-tabler-circle-x');
  }
}

// Function to delete CPPT
const deleteCppt = async (noRawat: string, tglPerawatan: string, jamRawat: string) => {
  syncLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 3000));
  const { data, error, refresh, status } = await useAsyncData(
    `${config.public.API_V2_URL}/pasien/riwayat/pemeriksaan/${props.statusLanjut}/delete/synced`,
    () => $fetch(`${config.public.API_V2_URL}/pasien/riwayat/pemeriksaan/${props.statusLanjut}/delete/synced`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ no_rawat: noRawat, tgl_perawatan: tglPerawatan, jam_rawat: jamRawat })
    }),
    { immediate: true, lazy: true }
  );

  syncLoading.value = false;

  if (status.value === 'success') {
    cpptRefresh();
    addToaster('CPPT Deleted', 'Data CPPT berhasil dihapus', 'primary', 'i-tabler-check');
  }

  if (status.value === 'error') {
    console.error('Error deleting CPPT:', error.value);
    addToaster('Gagal Hapus CPPT', error.value?.data?.message || 'Terjadi kesalahan saat menghapus CPPT', 'red', 'i-tabler-circle-x');
  }
}
</script>