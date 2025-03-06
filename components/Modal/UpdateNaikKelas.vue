<template>
  <UModal v-model="localIsOpen" prevent-close>
    <UCard>
      <template #header>
        <div class="w-full flex items-center justify-between">
          <p class="font-semibold">Update Detail Naik Kelas</p>
          <UButton variant="ghost" color="gray" icon="i-tabler-x" size="sm" @click="localIsOpen = false" />
        </div>
      </template>

      <UForm :schema="Schema" :state="state" class="flex flex-col gap-6" @submit="onSubmit">
        <!-- warning messages -->
        <UAlert
          icon="i-heroicons-command-line"
          color="yellow"
          variant="subtle"
          title="Perhatian !"
          description="Pastikan data yang diinputkan sudah benar dengan data pasien yang bersangkutan."
        />

        <div class="space-y-4">
          <UFormGroup label="Diagnosa" name="diagnosa">
            <UTextarea placeholder="Masukkan diagnosa" v-model="state.diagnosa" />
          </UFormGroup>

          <UFormGroup label="Jenis Naik Kelas" name="jenis_naik">
            <UInput placeholder="Jenis Naik Kelas" class="bg-gray-600 rounded-lg" disabled v-model="state.jenis_naik" />
          </UFormGroup>

          <div class="grid grid-cols-2 gap-3 w-full">
            <UFormGroup class="w-full" label="Tarif 1" name="tarif_1">
              <UInput type="number" placeholder="Tarif 1" class="bg-gray-600 rounded-lg" disabled v-model="state.tarif_1" />
            </UFormGroup>

            <UFormGroup class="w-full" label="Tarif 2" name="tarif_2">
              <UInput type="number" placeholder="Tarif 2" class="bg-gray-600 rounded-lg" disabled v-model="state.tarif_2" />
            </UFormGroup>
            
            <UFormGroup class="w-full" label="Presentase (%)" name="presentase">
              <UInput type="number" placeholder="Presentase" class="bg-gray-600 rounded-lg" disabled v-model="state.presentase" />
            </UFormGroup>
  
            <UFormGroup class="w-full" label="Tarif Akhir" name="tarif_akhir">
              <UInput type="number" placeholder="Tarif Akhir" class="bg-gray-600 rounded-lg" disabled v-model="state.tarif_akhir" />
            </UFormGroup>
          </div>

        </div>

        <div class="mt-4 flex justify-end">
          <UButton type="submit" color="primary">Simpan</UButton>
        </div>
      </UForm>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import { ref, watch } from 'vue'
import {z} from "zod";

const props = defineProps({
  isOpen: { required: true, type: Boolean },
  sep: { required: true, type: String },
})

const config = useRuntimeConfig();
const tokenStore = useAccessTokenStore();
const localIsOpen = ref(props.isOpen);
const toast = useToast();
const emit = defineEmits(['update:isOpen']);

// Form Schema
const schema = z.object({
  jenis_naik: z.string(),
  diagnosa: z.string(),
  tarif_1: z.union([
    z.string().regex(/^\d+$/, "Hanya angka yang diperbolehkan"),
    z.number().min(0, "Angka harus minimal 0"),
  ]),
  tarif_2: z.union([
    z.string().regex(/^\d+$/, "Hanya angka yang diperbolehkan"),
    z.number().min(0, "Angka harus minimal 0"),
  ]),
  presentase: z.union([
    z.string().regex(/^\d+$/, "Hanya angka yang diperbolehkan"),
    z.number().min(0, "Angka harus minimal 0"),
  ]),
  tarif_akhir: z.union([
    z.string().regex(/^\d+$/, "Hanya angka yang diperbolehkan"),
    z.number().min(0, "Angka harus minimal 0"),
  ]),
});

type Schema = z.output<typeof schema>

const state = reactive({
  jenis_naik: '',
  diagnosa: '',
  tarif_1: 0,
  tarif_2: 0,
  presentase: 0,
  tarif_akhir: 0,
})

// Fungsi untuk mengambil detail data dari API
const fetchData = async () => {
  try {
    const response = await $fetch(`${config.public.API_V2_URL}/naik-kelas/${props.sep}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
    });

    if (response?.data?.no_sep) {
      const data = response.data
      state.jenis_naik = data.jenis_naik
      state.diagnosa = data.diagnosa
      state.tarif_1 = data.tarif_1
      state.tarif_2 = data.tarif_2
      state.presentase = data.presentase
      state.tarif_akhir = data.tarif_akhir
    } else {
      console.error('Gagal mengambil data:', response)
    }
  } catch (error) {
    console.error('Gagal mengambil data:', error)
  }
}

// Watch perubahan `localIsOpen` untuk fetch data saat modal dibuka
watch(localIsOpen, async (newValue) => {
  emit('update:isOpen', newValue)

  if (newValue) {
    await fetchData()
  }
})

// Sinkronisasi perubahan dari parent
watch(() => props.isOpen, (newValue) => {
  localIsOpen.value = newValue
})

// Fungsi submit form
const onSubmit = async (event: FormSubmitEvent<Schema>) => {
  try {
    const response = await $fetch(`${config.public.API_V2_URL}/naik-kelas/${props.sep}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${tokenStore.accessToken}` },
      body: JSON.stringify({ diagnosa: event.data.diagnosa }),
    });

    if (response?.data?.no_sep) {
      localIsOpen.value = false
      emit('update:isOpen', false)
      toast.add({ icon: 'i-tabler-circle-check', title: 'Berhasil!', description: 'Data berhasil diupdate', color: 'green', timeout: 2000});
    } else {
      console.error('Gagal mengupdate data:', response)
      toast.add({ icon: 'i-tabler-circle-x', title: 'Error!', description: 'Gagal mengupdate data', color: 'red', timeout: 2000});
    }
  } catch (error) {
    console.error('Gagal mengupdate data:', error)
    toast.add({ icon: 'i-tabler-circle-x', title: 'Error!', description: 'Gagal mengupdate data', color: 'red', timeout: 2000});
  }
}
</script>
