<script setup lang="ts">
import { z } from 'zod'
import { format } from 'date-fns'
import { reactive, onMounted } from 'vue'

import type { MaskInputOptions } from 'maska'
import type { FormSubmitEvent } from '#ui/types'
import type { BillingPasien, Diagnosa, DiagnosaData, KamarInap, RegPeriksa, SepData, TensiData } from '~/types';

import { tarifFields } from '~/data/tarifFields'
import { getTanggalKeluar } from '~/common/helpers/dataHelpers'
import { PrepareKlaimData } from '~/common/helpers/PrepareKlaimData'
import { getEnabledCobData, getCaraBayarData } from '~/utils/getStaticData'

const isLoading = ref(false)
const toast = useToast()
const tokenStore = useAccessTokenStore()
const { sep, regPeriksa, kamarInap, billing, diagnosa, tensi } = defineProps<{
  sep?: SepData
  regPeriksa?: RegPeriksa,
  kamarInap?: KamarInap,
  billing?: BillingPasien,
  diagnosa?: Diagnosa[],
  tensi?: TensiData,
}>();

// Initialize an array to hold the options
const caraPulangOptions = reactive<{ label: string; value: string }[]>([])
const jenisTarifOptions = reactive<{ label: string; value: string }[]>([])
const carabayarOptions = reactive<{ label: string; value: string }[]>([])
const caraMasukOptions = reactive<{ label: string; value: string }[]>([])
const dpjpOptions = reactive<{ label: string; value: string }[]>([])
const cobOptions = reactive<{ label: string; value: string }[]>([])

// Define the schema for validation
const schema = z.object({
  payor_label: z.string().min(1, "Jaminan / Cara Bayar haris dipilih"),
  payor_id: z.string().min(1, "Jaminan / Cara Bayar haris dipilih"),
  payor_cd: z.string().min(1, "Jaminan / Cara Bayar haris dipilih"),
  nomor_kartu: z.string(),
  nomor_sep: z.string(),
  cob_cd: z.string().optional(),
  jenis_rawat: z.number().int().refine(value => [1, 2, 3].includes(value), { message: 'Jenis rawat tidak valid' }).optional(),
  upgrade_class_ind: z.boolean().optional(),
  icu_indikator: z.boolean().optional(),
  executive_class_ind: z.boolean().optional(),
  tariff_class: z.number().int().refine(value => [1, 2, 3].includes(value), { message: 'Kelas hak tidak valid' }).optional(),
  tgl_masuk: z.date().optional(),
  tgl_pulang: z.date().optional(),
  age: z.number().int().min(0).optional(),
  cara_masuk: z.string().optional(),
  los: z.number().int().min(0).optional(),
  los_in_hour: z.string().optional(),
  birth_weight: z.number().int().min(0).optional(),
  adl_sub_acute: z.number().int().min(12).max(60).optional(),
  adl_chronic: z.number().int().min(12).max(60).optional(),
  discharge_status: z.string().optional(),
  nama_dokter: z.string().optional(),
  kode_tarif: z.string().optional(),
  jkn_sitb_checked_ind: z.boolean().optional(),
  co_insidence_ind_jkn: z.boolean().optional(),
  upgrade_class_class: z.string().optional(),
  upgrade_class_los: z.string().optional(),
  use_ind: z.boolean().optional(),
  start_dttm: z.date().optional(),
  stop_dttm: z.date().optional(),
  icu_los: z.number().int().min(0).optional(),
  tarif_poli_eks: z.number().int().min(0),

  prosedur_non_bedah: z.number().int().min(0).optional(),
  prosedur_bedah: z.number().int().min(0).optional(),
  konsultasi: z.number().int().min(0).optional(),
  tenaga_ahli: z.number().int().min(0).optional(),
  keperawatan: z.number().int().min(0).optional(),
  penunjang: z.number().int().min(0).optional(),
  radiologi: z.number().int().min(0).optional(),
  laboratorium: z.number().int().min(0).optional(),
  pelayanan_darah: z.number().int().min(0).optional(),
  rehabilitasi: z.number().int().min(0).optional(),
  kamar: z.number().int().min(0).optional(),
  rawat_intensif: z.number().int().min(0).optional(),
  obat: z.number().int().min(0).optional(),
  obat_kronis: z.number().int().min(0).optional(),
  obat_kemoterapi: z.number().int().min(0).optional(),
  alkes: z.number().int().min(0).optional(),
  bmhp: z.number().int().min(0).optional(),
  sewa_alat: z.number().int().min(0).optional(),
})

type Schema = z.output<typeof schema>

// Define the reactive state for the form
const state = reactive<Schema>({
  payor_label         : '',
  payor_id            : '',
  payor_cd            : '',
  nomor_kartu         : sep?.no_kartu ?? '',
  nomor_sep           : sep?.no_sep ?? '',
  cob_cd              : undefined,
  jenis_rawat         : parseInt(`${sep?.jnspelayanan}` ?? 0),
  upgrade_class_ind   : !!sep?.klsnaik,
  icu_indikator       : false,
  executive_class_ind : false,
  tariff_class        : parseInt(`${sep?.klsrawat}` ?? 0),
  tgl_masuk           : new Date(regPeriksa?.tgl_registrasi + ' ' + regPeriksa?.jam_reg),
  tgl_pulang          : undefined,
  age                 : regPeriksa?.umurdaftar,
  cara_masuk          : undefined,
  los                 : kamarInap?.lama_inap,
  los_in_hour         : kamarInap?.lama_jam,
  birth_weight        : regPeriksa?.umurdaftar == 0 ? regPeriksa?.pasien_bayi?.berat_badan: 0,
  adl_sub_acute       : undefined,
  adl_chronic         : undefined,
  discharge_status    : undefined,
  nama_dokter         : undefined,
  kode_tarif          : "CS",
  jkn_sitb_checked_ind: false,
  co_insidence_ind_jkn: false,
  upgrade_class_class : undefined,
  upgrade_class_los   : undefined,
  use_ind             : false,
  start_dttm          : undefined,
  stop_dttm           : undefined,
  icu_los             : undefined,
  tarif_poli_eks      : 0,

  prosedur_non_bedah  : billing?.prosedur_non_bedah ?? 0,
  prosedur_bedah      : billing?.prosedur_bedah ?? 0,
  konsultasi          : billing?.konsultasi ?? 0,
  tenaga_ahli         : billing?.tenaga_ahli ?? 0,
  keperawatan         : billing?.keperawatan ?? 0,
  penunjang           : billing?.penunjang ?? 0,
  radiologi           : billing?.radiologi ?? 0,
  laboratorium        : billing?.laboratorium ?? 0,
  pelayanan_darah     : billing?.pelayanan_darah ?? 0,
  rehabilitasi        : billing?.rehabilitasi ?? 0,
  kamar               : billing?.kamar ?? 0,
  rawat_intensif      : billing?.rawat_intensif ?? 0,
  obat                : billing?.obat ?? 0,
  obat_kronis         : billing?.obat_kronis ?? 0,
  obat_kemoterapi     : billing?.obat_kemoterapi ?? 0,
  alkes               : billing?.alkes ?? 0,
  bmhp                : billing?.bmhp ?? 0,
  sewa_alat           : billing?.sewa_alat ?? 0,
})

// watch state.tgl_masuk and tgl_

// Fetch the COB data on component mount
onMounted(async () => {
  let tgl_keluar = ref('')
  if (kamarInap && kamarInap?.detail?.length > 0) {
    tgl_keluar = computed(() => getTanggalKeluar(kamarInap));
  }

  state.tgl_pulang = new Date(tgl_keluar.value)

  try {
    const cob = await getEnabledCobData()
    const cbo = await getCaraBayarData()
    const cms = await getCaraMasukData()
    const cpo = await getCaraPulangData()
    const jto = await getJenisTarifData()
    const dpjpo = await getDpjpData()

    cobOptions.push(...cob)
    carabayarOptions.push(...cbo)
    caraMasukOptions.push(...cms)
    caraPulangOptions.push(...cpo)
    jenisTarifOptions.push(...jto)
    dpjpOptions.push(...dpjpo)
  } catch (error) {
    console.error('Failed to load COB options:', error)
  }
})

const onChangePayorCd = (payor: CarabayarData) => {
  state.payor_label = payor.label
  state.payor_cd    = payor.description
  state.payor_id    = payor.value
}

// Handle form submission
async function onSubmit(event: FormSubmitEvent<Schema>) {
  isLoading.value = true

  if (sep?.no_sep == '' || sep?.no_sep == undefined) {
    toast.add({ 
      title: 'Nomor SEP tidak ada',
      description: "Nomor SEP tidak ada, silahkan cek kembali data pasien",
      color: 'red'
    })

    isLoading.value = false
  }

  // map the data and remove the undefined values from data
  const mappedData = PrepareKlaimData(event.data)

  // add this json to mappedData { diagnosa: "#", procedure: "#" }
  mappedData.diagnosa = ["O41.0", "O83.9", "Z37.0"]
  mappedData.procedure = ["73.4"]
  mappedData.diagnosa_inagrouper = ["O41.0", "O83.9", "Z37.0"]
  mappedData.procedure_inagrouper = ["73.4"]

  const { data, error, refresh, status } = await useFetch(`http://172.24.19.22/rsia/api/v2/eklaim/${sep?.no_sep}`,{
    method: 'POST',
    body: mappedData
  })

  if (error.value) {
    toast.add({
      title: 'Failed to submit',
      description: `${error.value.message}, please check the logs for more details`,
      color: 'red'
    })

    isLoading.value = false
    return
  }

  if (status.value == 'success') {
    toast.add({
      title: 'Success',
      description: 'Data berhasil disimpan & di grouping',
      color: 'green'
    })
  }

  isLoading.value = false
}

const moneyMask = reactive<MaskInputOptions>({
  mask: 'money',
  number: {
    fraction: 0,
    locale: 'id-ID',
    unsigned: true
  },
})
</script>

<template>
  <div>
    <UForm :schema="schema" :state="state" class="flex flex-col gap-6" @submit="onSubmit">
      <div class="flex flex-col lg:flex-row gap-4">
        <UFormGroup label="Jaminan / Cara Bayar" name="payor_label" class="w-full">
          <USelectMenu v-model="state.payor_label" :options="carabayarOptions" placeholder="jaminan / cara bayar" :onChange="onChangePayorCd" searchable/>
        </UFormGroup>
        <UFormGroup label="No. Peserta" name="nomor_kartu" class="w-full">
          <UInput placeholder="nomor peserta" v-model="state.nomor_kartu" :readonly="true" />
        </UFormGroup>
        <UFormGroup label="No. SEP" name="nomor_sep" class="w-full">
          <UInput placeholder="nomor sep" v-model="state.nomor_sep" :readonly="true" />
        </UFormGroup>
        <UFormGroup label="COB" name="cob_cd" class="w-full">
          <USelectMenu v-model="state.cob_cd" :options="cobOptions" placeholder="cob" option-attribute="label" value-attribute="value" searchable />
        </UFormGroup>
      </div>

      <UDivider />

      <div class="flex flex-col lg:flex-row gap-4 justify-between">
        <UFormGroup label="Jenis Rawat" name="jenis_rawat">
          <URadioGroup v-model="state.jenis_rawat" :options="[{ value: 2, label: 'Rawat Jalan' }, { value: 1, label: 'Rawat Inap' }]" />
        </UFormGroup>
        <div class="flex gap-3">
          <div class="my-2 md:my-0 md:mt-6" v-if="state.jenis_rawat == 1 && state.payor_cd != 'JPS'">
            <UCheckbox v-model="state.upgrade_class_ind" name="upgrade_class_ind" label="Naik / Turun Kelas" />
          </div>
          <div class="my-2 md:my-0 md:mt-6" v-if="state.jenis_rawat == 1">
            <UCheckbox v-model="state.icu_indikator" name="icu_indikator" label="Ada Rawat Intensif" />
          </div>
          <div class="my-2 md:my-0 md:mt-6" v-if="state.jenis_rawat == 2 && state.payor_cd != 'JPS'">
            <UCheckbox v-model="state.executive_class_ind" name="executive_class_ind" label="Kelas Eksekutif" />
          </div>
        </div>

        <div v-if="state.jenis_rawat == 1">
          <UFormGroup label="Kelas Hak" name="tariff_class" class="min-w-[250px]">
            <URadioGroup v-model="state.tariff_class" :options="[{ value: 3, label: 'Kelas 3' }, { value: 2, label: 'Kelas 2' }, { value: 1, label: 'Kelas 1' }]" disabled />
          </UFormGroup>
        </div>
        <div v-else="">
          <UFormGroup label="Kelas Hak" class="min-w-[250px]">
            -
          </UFormGroup>
        </div>
      </div>

      <div class="flex flex-col lg:flex-row gap-4 justify-between">
        <div class="flex flex-col md:flex-row gap-3">
          <UFormGroup label="Tanggal Masuk" name="tgl_masuk" class="w-full md:w-max min-w-[180px]">
            <UPopover :popper="{ placement: 'bottom-start' }" class="mt-1.5">
              <UButton variant="link" color="green" icon="i-heroicons-calendar-days-20-solid" :label="state.tgl_masuk ? format(new Date(state.tgl_masuk), 'dd MMMM yyyy HH:ii') : 'Pilih Tanggal Masuk'" />

              <template #panel="{ close }">
                <DatePicker is-required @close="close" mode="dateTime" v-model="state.tgl_masuk" />
              </template>
            </UPopover>
          </UFormGroup>

          <UFormGroup label="Tanggal Keluar" name="tgl_pulang" class="w-full md:w-max min-w-[180px]">
            <UPopover :popper="{ placement: 'bottom-start' }" class="mt-1.5">
              <UButton variant="link" color="lime" icon="i-heroicons-calendar-days-20-solid" :label="state.tgl_pulang ? format(new Date(state.tgl_pulang), 'dd MMMM yyyy HH:ii') : 'Pilih Tanggal Keluar'" :disabled="state.jenis_rawat == 2"/>

              <template #panel="{ close }">
                <DatePicker is-required @close="close" mode="dateTime" v-model="state.tgl_pulang" />
              </template>
            </UPopover>
          </UFormGroup>
        </div>

        <UFormGroup label="Umur Pasien" name="age">
          <UInput placeholder="Umur Pasien" v-model="state.age" :readonly="true" class="w-full md:w-max min-w-[18.4em]">
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400 text-xs">{{ regPeriksa?.sttsumur }}</span>
            </template>
          </UInput>
        </UFormGroup>
      </div>

      <UDivider />

      <div class="flex flex-col lg:flex-row gap-4 justify-between">
        <UFormGroup label="Cara Masuk" name="cara_masuk" class="w-full md:w-min md:min-w-[26.6em]">
          <USelectMenu v-model="state.cara_masuk" :options="caraMasukOptions" value-attribute="value" option-attribute="label" placeholder="cara masuk pasien" searchable />
        </UFormGroup>
      </div>

      <div v-if="state.upgrade_class_ind" class="flex flex-col md:flex-row gap-4 justify-between">
        <URadioGroup v-model="state.upgrade_class_class" legend="Kelas Pelayanan" :options="[{ value: 'kelas_3', label: 'Kelas 3' }, { value: 'kelas_2', label: 'Kelas 2' }, { value: 'kelas_1', label: 'Kelas 1' }, { value: 'vip', label: 'Diatas kelas 1' }]" />
        <UFormGroup label="Rawat Intensif" name="icu_los">
          <UInput placeholder="Lama upgrade kelas" v-model="state.upgrade_class_los">
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400 text-xs">Hari</span>
            </template>
          </UInput>
        </UFormGroup> 
      </div>
      
      <div v-if="state.icu_indikator" class="flex flex-col md:flex-row gap-4 justify-between">
        <div class="flex gap-12">
          <UFormGroup label="Ventilator" name="use_ind">
            <UCheckbox v-model="state.use_ind" name="use_ind" label="Ya" />
          </UFormGroup>

          <div class="flex flex-col md:flex-row gap-3" v-if="state.use_ind">
            <UFormGroup label="Intubasi" name="start_dttm" class="w-full md:w-max min-w-[180px]">
              <UPopover :popper="{ placement: 'bottom-start' }" class="mt-1.5">
                <UButton variant="link" color="sky" icon="i-heroicons-calendar-days-20-solid" :label="state.start_dttm ? format(new Date(state.start_dttm), 'dd MMMM yyyy HH:ii') : 'Pilih Tanggal Intubasi'" />

                <template #panel="{ close }">
                  <DatePicker is-required @close="close" mode="dateTime" v-model="state.start_dttm" />
                </template>
              </UPopover>
            </UFormGroup>

            <UFormGroup label="Ekstubasi" name="stop_dttm" class="w-full md:w-max min-w-[180px]">
              <UPopover :popper="{ placement: 'bottom-start' }" class="mt-1.5">
                <UButton variant="link" color="blue" icon="i-heroicons-calendar-days-20-solid" :label="state.stop_dttm ? format(new Date(state.stop_dttm), 'dd MMMM yyyy HH:ii') : 'Pilih Tanggal Ekstubasi'"/>

                <template #panel="{ close }">
                  <DatePicker is-required @close="close" mode="dateTime" v-model="state.stop_dttm" />
                </template>
              </UPopover>
            </UFormGroup>
          </div>
        </div>

        <UFormGroup label="Rawat Intensif" name="icu_los">
          <UInput placeholder="rawat intensif" v-model="state.icu_los" :readonly="true">
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400 text-xs">Hari</span>
            </template>
          </UInput>
        </UFormGroup>
      </div>

      <div class="flex flex-col lg:flex-row gap-4 justify-between">
        <div class="flex gap-4">
          <UFormGroup label="LOS" name="los">
            <UInput placeholder="los in day" v-model="state.los" :readonly="true">
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-xs">Hari</span>
              </template>
            </UInput>
          </UFormGroup>
          <UFormGroup name="los_in_hour" class="mt-6">
            <UInput placeholder="los in hour" v-model="state.los_in_hour" :readonly="true">
              <template #trailing>
                <span class="text-gray-500 dark:text-gray-400 text-xs">Jam</span>
              </template>
            </UInput>
          </UFormGroup>
        </div>

        <UFormGroup label="Berat Lahir" name="birth_weight">
          <UInput placeholder="Berat Lahir" v-model="state.birth_weight" :readonly="true" class="w-full md:w-max min-w-[18.4em]">
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400 text-xs">gram</span>
            </template>
          </UInput>
        </UFormGroup>
      </div>

      <UDivider label="ADL Score"/>

      <div class="flex flex-col lg:flex-row gap-4 justify-between">
        <div class="flex gap-4">
          <UFormGroup label="Sub Acute" name="adl_sub_acute" class="w-full lg:w-min lg:min-w-[18.4em]">
            <UInput placeholder="adl score sub acute" v-model="state.adl_sub_acute" />
          </UFormGroup>
          <UFormGroup label="Chronic" name="adl_chronic" class="w-full lg:w-min lg:min-w-[18.4em]">
            <UInput placeholder="adl score cronic" v-model="state.adl_chronic" />
          </UFormGroup>
        </div>

        <UFormGroup label="Cara Pulang" name="discharge_status" class="w-full lg:w-[25%]">
          <USelectMenu v-model="state.discharge_status" value-attribute="value" option-attribute="label" :options="caraPulangOptions" placeholder="cara pulang pasien" searchable />
        </UFormGroup>
      </div>
      
      <div class="flex flex-col lg:flex-row gap-4">
        <UFormGroup label="DPJP" name="nama_dokter" class="w-full lg:w-[25%]">
          <USelectMenu v-model="state.nama_dokter" :options="dpjpOptions" value-attribute="value" option-attribute="label" placeholder="DPJP" searchable />
        </UFormGroup>
        
        <UFormGroup label="Jenis Tarif" name="kode_tarif" class="w-full lg:w-[25%]">
          <USelectMenu v-model="state.kode_tarif" :options="jenisTarifOptions" value-attribute="value" option-attribute="label" placeholder="jenis tarif RS" searchable />
        </UFormGroup>
      </div>

      <UDivider />

      <div class="flex flex-col md:flex-row gap-7" v-if="state.payor_cd != 'JPS'">
        <UFormGroup label="Pasien TB" name="jkn_sitb_checked_ind">
          <UCheckbox v-model="state.jkn_sitb_checked_ind" name="jkn_sitb_checked_ind" label="Ya" />
        </UFormGroup>

        <div class="flex gap-2 mt-3" v-if="state.jkn_sitb_checked_ind">
          <UInput placeholder="nomor register sitb" class="w-full lg:w-min lg:min-w-[300px]"/>
          <UButton variant="soft" color="blue">Validasi</UButton>
        </div>
      </div>
      
      <div class="flex flex-col md:flex-row gap-7" v-if="state.executive_class_ind">
        <UFormGroup label="Tarif Poli Eks.">
          <UInput v-model="state.tarif_poli_eks" icon="i-heroicons-banknotes" class="w-full lg:w-min lg:min-w-[300px]"/>
        </UFormGroup>
      </div>

      <div class="flex flex-col md:flex-row gap-7" v-if="state.payor_cd != 'JPS' && state.jenis_rawat == 1 || state.payor_cd == 'JPS' && state.jenis_rawat == 2 || state.payor_cd == 'JKN' && state.jenis_rawat != 2 || state.payor_cd == 'JKN' && state.jenis_rawat == 1">
        <UFormGroup label="Co-Insidense COVID-19" name="co_insidence_ind_jkn">
          <UCheckbox v-model="state.co_insidence_ind_jkn" name="co_insidence_ind_jkn" label="Ya" />
        </UFormGroup>

        <div class="flex gap-2 mt-3" v-if="state.co_insidence_ind_jkn">
          <UInput placeholder="nomor klaim COVID-19" class="w-full lg:w-min lg:min-w-[300px]"/>
          <UButton variant="soft" color="blue">Validasi</UButton>
        </div>
      </div>
      
      <div class="p-3 lg:p-6 rounded bg-cool-800 shadow-inner">
        <div class="grid grid-cols-2 lg:grid-cols-3 gap-2 lg:gap-4">
          <UFormGroup v-for="(field, index) in tarifFields" :key="index" :label="field.label" :name="field.name">
            <UInput v-model="(state as any)[field.name]" :placeholder="field.name" type="text" v-maska="moneyMask" inputmode="numeric">
              <template #leading>
                <span class="text-gray-500 dark:text-gray-400 text-xs">Rp</span>
              </template>
            </UInput>
          </UFormGroup>
        </div>
      </div>

      <div class="flex justify-end pt-10">
        <UButton type="submit" :loading="isLoading">Submit</UButton>
      </div>
    </UForm>
  </div>
</template>
