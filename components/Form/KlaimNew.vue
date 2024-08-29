<script setup lang="ts">
import { z } from 'zod'
import { format } from 'date-fns'
import { reactive, onMounted } from 'vue'
import { Sortable } from "sortablejs-vue3"

import type { FormSubmitEvent, NotificationColor } from '#ui/types'
import type { BillingPasien, Diagnosa, KamarInap, Prosedur, RegPeriksa, SepData, TensiData } from '~/types';

import { moneyMask } from '~/common/masks'
import { tarifFields } from '~/data/tarifFields'
import { getTanggalKeluar } from '~/common/helpers/dataHelpers'
import { PrepareKlaimData } from '~/common/helpers/PrepareKlaimData'
import { getEnabledCobData, getCaraBayarData } from '~/utils/getStaticData'
import { fetchDiagnosaUnu, fetchProsedurUnu, dul, pul } from '~/utils/searchDiagnosis'

const toast = useToast()
const isLoading = ref(false)
const optionLoading = ref(false)
const tokenStore = useAccessTokenStore()
const { sep, regPeriksa, kamarInap, billing, diagnosa, prosedur, tensi } = defineProps<{
  sep?: SepData
  regPeriksa?: RegPeriksa,
  kamarInap?: KamarInap,
  billing?: BillingPasien,
  diagnosa?: Diagnosa[],
  prosedur?: Prosedur[],
  tensi?: TensiData,
}>();

const addToaster = (title: string, description: string, color: NotificationColor, icon: string) => {
  toast.add({ 
    title: title,
    description: description,
    color: color,
    icon: icon
   })
}

const moveItemInArray = (arr: any[], from: number, to: number) => {
  const item = arr.splice(from, 1)[0]
  arr.splice(to, 0, item)
}

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

  prosedur_non_bedah: z.string().min(0).optional(),
  prosedur_bedah: z.string().min(0).optional(),
  konsultasi: z.string().min(0).optional(),
  tenaga_ahli: z.string().min(0).optional(),
  keperawatan: z.string().min(0).optional(),
  penunjang: z.string().min(0).optional(),
  radiologi: z.string().min(0).optional(),
  laboratorium: z.string().min(0).optional(),
  pelayanan_darah: z.string().min(0).optional(),
  rehabilitasi: z.string().min(0).optional(),
  kamar: z.string().min(0).optional(),
  rawat_intensif: z.string().min(0).optional(),
  obat: z.string().min(0).optional(),
  obat_kronis: z.string().min(0).optional(),
  obat_kemoterapi: z.string().min(0).optional(),
  alkes: z.string().min(0).optional(),
  bmhp: z.string().min(0).optional(),
  sewa_alat: z.string().min(0).optional(),

  sistole: z.string().min(0).optional(),
  diastole: z.string().min(0).optional(),

  diagnosa_inagrouper: z.array(z.string().refine(value => value.length > 0, { message: 'Diagnosa harus dipilih' })).optional(),
  procedure_inagrouper: z.array(z.string().refine(value => value.length > 0, { message: 'Diagnosa harus dipilih' })).optional(),

  usia_kehamilan: z.number().int().min(0).optional(),
  gravida: z.number().int().min(0).optional(),
  partus: z.number().int().min(0).optional(),
  abortus: z.number().int().min(0).optional(),
  onset_kontraksi: z.enum(['spontan', 'induksi', 'non_spontan_non_induksi']).optional(),
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

  prosedur_non_bedah  : `${billing?.prosedur_non_bedah ?? "0"}`,
  prosedur_bedah      : `${billing?.prosedur_bedah ?? "0"}`,
  konsultasi          : `${billing?.konsultasi ?? "0"}`,
  tenaga_ahli         : `${billing?.tenaga_ahli ?? "0"}`,
  keperawatan         : `${billing?.keperawatan ?? "0"}`,
  penunjang           : `${billing?.penunjang ?? "0"}`,
  radiologi           : `${billing?.radiologi ?? "0"}`,
  laboratorium        : `${billing?.laboratorium ?? "0"}`,
  pelayanan_darah     : `${billing?.pelayanan_darah ?? "0"}`,
  rehabilitasi        : `${billing?.rehabilitasi ?? "0"}`,
  kamar               : `${billing?.kamar ?? "0"}`,
  rawat_intensif      : `${billing?.rawat_intensif ?? "0"}`,
  obat                : `${billing?.obat ?? "0"}`,
  obat_kronis         : `${billing?.obat_kronis ?? "0"}`,
  obat_kemoterapi     : `${billing?.obat_kemoterapi ?? "0"}`,
  alkes               : `${billing?.alkes ?? "0"}`,
  bmhp                : `${billing?.bmhp ?? "0"}`,
  sewa_alat           : `${billing?.sewa_alat ?? "0"}`,

  sistole             : tensi?.tensi ? tensi?.tensi.split('/')[0] : '',
  diastole            : tensi?.tensi ? tensi?.tensi.split('/')[1] : '',

  diagnosa_inagrouper : [],
  procedure_inagrouper: [],
})

// Fetch the COB data on component mount
onMounted(() => {
  optionLoading.value = true
  let tgl_keluar = ref('')
  if (kamarInap && kamarInap?.detail?.length > 0) {
    tgl_keluar = computed(() => getTanggalKeluar(kamarInap));
  }

  state.tgl_pulang = new Date(tgl_keluar.value)

  setTimeout(async () => {
    try {
      const [cob, cbo, cms, cpo, jto, dpjpo] = await Promise.all([
        getEnabledCobData(),
        getCaraBayarData(),
        getCaraMasukData(),
        getCaraPulangData(),
        getJenisTarifData(),
        getDpjpData()
      ]);

      state.payor_label = cbo[0].label
      state.payor_id = cbo[0].value
      state.payor_cd = cbo[0].label

      cobOptions.push(...cob);
      carabayarOptions.push(...cbo);
      caraMasukOptions.push(...cms);
      caraPulangOptions.push(...cpo);
      jenisTarifOptions.push(...jto);
      dpjpOptions.push(...dpjpo);
    } catch (error) {
      console.error('Failed to load COB options:', error)
    }

    optionLoading.value = false
  }, 1200)
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
    addToaster('Nomor SEP tidak ada', 'Nomor SEP tidak ada, silahkan cek kembali data pasien', 'red', 'i-heroicons-information-circle')

    isLoading.value = false
  }

  // map the data and remove the undefined values from data
  const mappedData = PrepareKlaimData(event.data)  

  mappedData.diagnosa             = diagnosa?.map(d => d.kd_penyakit) ?? ["#"]
  mappedData.procedure            = prosedur?.map(p => p.kode) ?? ["#"]

  const { data, error, refresh, status } = await useFetch(`http://172.24.19.22/rsia/api/v2/eklaim/${sep?.no_sep}`,{
    method: 'POST',
    body: mappedData
  })

  if (error.value) {
    console.log(error.value.data.metadata);

    addToaster('Failed to submit', `${error.value.message}, please check the logs for more details`, 'red', 'i-heroicons-information-circle')
    isLoading.value = false
    return
  }

  if (status.value == 'success') {
    addToaster('Success', 'Data berhasil disimpan & di grouping', 'green', 'i-heroicons-check-badge')
  }

  isLoading.value = false
}
</script>

<template>
  <div>
    <UForm :schema="schema" :state="state" class="flex flex-col gap-6" @submit="onSubmit">
      <div class="flex flex-col lg:flex-row gap-4">
        <UFormGroup label="Jaminan / Cara Bayar" name="payor_label" class="w-full">
          <USelectMenu v-model="state.payor_label" :loading="optionLoading" :options="carabayarOptions" placeholder="jaminan / cara bayar" :onChange="onChangePayorCd" searchable/>
        </UFormGroup>
        <UFormGroup label="No. Peserta" name="nomor_kartu" class="w-full">
          <UInput placeholder="nomor peserta" v-model="state.nomor_kartu" :readonly="true" />
        </UFormGroup>
        <UFormGroup label="No. SEP" name="nomor_sep" class="w-full">
          <UInput placeholder="nomor sep" v-model="state.nomor_sep" :readonly="true" />
        </UFormGroup>
        <UFormGroup label="COB" name="cob_cd" class="w-full">
          <USelectMenu v-model="state.cob_cd" :loading="optionLoading" value-attribute="value" :options="cobOptions" placeholder="cob" searchable />
        </UFormGroup>
      </div>

      <UDivider />

      <div class="flex flex-col lg:flex-row gap-4 justify-between">
        <UFormGroup label="Jenis Rawat" name="jenis_rawat">
          <URadioGroup v-model="state.jenis_rawat" :loading="optionLoading" value-attribute="value" :options="[{ value: 2, label: 'Rawat Jalan' }, { value: 1, label: 'Rawat Inap' }]" :ui="{fieldset: 'flex flex-row gap-4'}" />
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
            <URadioGroup v-model="state.tariff_class" :loading="optionLoading" value-attribute="value" :options="[{ value: 3, label: 'Kelas 3' }, { value: 2, label: 'Kelas 2' }, { value: 1, label: 'Kelas 1' }]" :ui="{fieldset: 'flex flex-row gap-4'}" disabled />
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
          <USelectMenu v-model="state.cara_masuk" :loading="optionLoading" value-attribute="value" :options="caraMasukOptions" placeholder="cara masuk pasien" searchable />
        </UFormGroup>
      </div>

      <div v-if="state.upgrade_class_ind" class="flex flex-col md:flex-row gap-4 justify-between">
        <URadioGroup v-model="state.upgrade_class_class" legend="Kelas Pelayanan" :loading="optionLoading" value-attribute="value" :options="[{ value: 'kelas_3', label: 'Kelas 3', disabled: state.tariff_class && state.tariff_class <= 3 }, { value: 'kelas_2', label: 'Kelas 2', disabled: state.tariff_class && state.tariff_class <= 2 }, { value: 'kelas_1', label: 'Kelas 1', disabled: state.tariff_class && state.tariff_class <= 1 }, { value: 'vip', label: 'Diatas kelas 1' }]" :ui="{fieldset: 'flex flex-row gap-4'}" />
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
          <UInput placeholder="Berat Lahir" v-model="state.birth_weight" :readonly="true" class="w-full md:w-max min-w-[18.3em]">
            <template #trailing>
              <span class="text-gray-500 dark:text-gray-400 text-xs">gram</span>
            </template>
          </UInput>
        </UFormGroup>
      </div>

      <UDivider label="ADL Score"/>

      <div class="flex flex-col lg:flex-row gap-4 justify-between">
        <div class="flex gap-4">
          <UFormGroup label="Sub Acute" name="adl_sub_acute" class="w-full lg:w-min lg:min-w-[18.3em]">
            <UInput placeholder="adl score sub acute" v-model="state.adl_sub_acute" />
          </UFormGroup>
          <UFormGroup label="Chronic" name="adl_chronic" class="w-full lg:w-min lg:min-w-[18.3em]">
            <UInput placeholder="adl score cronic" v-model="state.adl_chronic" />
          </UFormGroup>
        </div>

        <UFormGroup label="Cara Pulang" name="discharge_status" class="w-full lg:w-[25%]">
          <USelectMenu v-model="state.discharge_status" :loading="optionLoading" value-attribute="value" :options="caraPulangOptions" placeholder="cara pulang pasien" searchable />
        </UFormGroup>
      </div>
      
      <div class="flex flex-col lg:flex-row gap-4">
        <UFormGroup label="DPJP" name="nama_dokter" class="w-full lg:min-w-[18.3em]">
          <USelectMenu v-model="state.nama_dokter" :loading="optionLoading" value-attribute="value" :options="dpjpOptions" placeholder="DPJP" searchable />
        </UFormGroup>
        
        <UFormGroup label="Jenis Tarif" name="kode_tarif" class="w-full lg:min-w-[18.3em]">
          <USelectMenu v-model="state.kode_tarif" :loading="optionLoading" value-attribute="value" :options="jenisTarifOptions" placeholder="jenis tarif RS" searchable />
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
      
      <UDivider label="Tarif Rumah Sakit" />

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

      <UDivider label="Diagnosa dan Prosedur" />

      <UTabs :items="[{ key: 'coding_unu', label: 'Coding UNU Grouper' }]" class="w-full">
        <template #default="{ item, index, selected }">
          <span class="truncate" :class="[selected && 'text-primary-500 dark:text-primary']">{{ item.label }}</span>
        </template>
        
        <template #item="{ item }">
          <div class="px-4 py-5 sm:p-6 bg-cool-800 shadow-inner rounded-lg">
            <div v-if="item.key === 'coding_unu'" class="space-y-3">
              
              <UDivider label="Diagnosa" :ui="{border: {base: 'flex border-cool-200 dark:border-cool-700'}, label: 'text-sm font-semibold text-primary'}" />

              <div class="flex flex-col lg:flex-row items-center justify-between">
                <h3 class="text-base font-semibold mb-2">Diagnosa UNU Grouper (<code>ICD-10</code>):</h3>
                <USelectMenu class="w-full lg:w-[300px]" 
                  :searchable="fetchDiagnosaUnu" 
                  :loading="dul" 
                  :onChange="(val: any) => {
                    diagnosa?.push({
                      kd_penyakit: val.value,
                      penyakit: {
                        kd_penyakit: val.value,
                        nm_penyakit: val.title
                      }
                    })
                  }" 
                  searchable-placeholder="cari diagnosa ..." 
                  placeholder="cari diagnosa ..." 
                />
              </div>

              <Sortable
                :list="diagnosa ?? []"
                item-key="id"
                tag="div"
                @end="(event) => moveItemInArray(diagnosa ?? [], event.oldIndex, event.newIndex)"
              >
                <template #item="{element, index}">
                  <div class="draggable mb-2 flex items-center justify-between gap-3 p-2 border rounded-xl border-cool-700"  :key="element.kd_penyakit">
                    <div class="flex gap-3 truncate text-ellipsis overflow-hidden">
                      <UBadge color="primary" variant="soft">{{ element.kd_penyakit }}</UBadge>
                      <span class="truncate text-ellipsis">{{ element.penyakit.nm_penyakit }}</span>
                    </div>
                    <!-- button close -->
                     <UButton variant="soft" color="red" @click="diagnosa?.splice(index, 1)" icon="i-heroicons-x-mark-solid" />
                  </div>
                </template>
              </Sortable>
              
              <UDivider label="Prosedur" :ui="{border: {base: 'flex border-cool-200 dark:border-cool-700'}, label: 'text-sm font-semibold text-primary'}" />
              
              <div class="flex flex-col lg:flex-row items-center justify-between">
                <h3 class="text-base font-semibold mb-2">Prosedur UNU Grouper (<code>ICD-9-CM</code>):</h3>
                <USelectMenu class="w-full lg:w-[300px]" 
                  :searchable="fetchProsedurUnu" 
                  :loading="pul" 
                  :onChange="(val: any) => {
                    prosedur?.push({
                      kode: val.value,
                      penyakit: {
                        kode: val.value,
                        deskripsi_panjang: val.title
                      }
                    })
                  }" 
                  searchable-placeholder="cari diagnosa ..." 
                  placeholder="cari diagnosa ..." 
                />
              </div>
            
              <Sortable
                :list="prosedur ?? []"
                item-key="id"
                tag="div"
                @end="(event) => moveItemInArray(prosedur ?? [], event.oldIndex, event.newIndex)"
              >
                <template #item="{element, index}">
                  <div class="draggable mb-2 flex items-center justify-between gap-3 p-2 border rounded-xl border-cool-700"  :key="element.kode">
                    <div class="flex gap-3 truncate text-ellipsis overflow-hidden">
                      <UBadge color="amber" variant="soft">{{ element.kode }}</UBadge>
                      <span class="truncate text-ellipsis">{{ element.penyakit.deskripsi_panjang }}</span>
                    </div>
                    <!-- button close -->
                     <UButton variant="soft" color="red" @click="prosedur?.splice(index, 1)" icon="i-heroicons-x-mark-solid" />
                  </div>
                </template>
              </Sortable>

            </div>
          </div>
        </template>
      </UTabs>

      <UDivider label="Data Klinis" />

      <div class="flex flex-col items-center justify-center gap-2">
        <p class="text-center font-semibold text-sm">Tekanan Darah (mmHg)</p>
        <div class="flex items-center justify-center gap-3">
          <UFormGroup name="sistole">
            <UInput placeholder="sistole" v-model="state.sistole" type="text" inputmode="number"/>
          </UFormGroup>
          <UFormGroup name="diastole">
            <UInput placeholder="diastole" v-model="state.diastole" type="text" inputmode="number"/>
          </UFormGroup>
        </div>
      </div>
      
      <UDivider />
      
      <div class="flex flex-col xl:flex-row gap-5 xl:gap-0 items-start justify-between">
        <div class="flex flex-col gap-2 w-full lg:w-[58%] lg:mx-auto xl:mx-0 xl:max-w-max">
          <p class="text-center font-semibold text-sm">Usia Kehamilan (minggu)</p>
          <UFormGroup name="usia_kehamilan">
            <UInput placeholder="usia kehamilan" type="number" inputmode="number" v-model="state.usia_kehamilan"/>
          </UFormGroup>
        </div>
        
        <div class="flex flex-col gap-2 w-full xl:max-w-max">
          <p class="text-center font-semibold text-sm">Riwayat Kehamilan Sebelumnya</p>
          <div class="flex gap-3 items-center justify-center w-full xl:max-w-max">
            <UFormGroup name="gravida">
              <UInput placeholder="gravida" v-model="state.gravida"/>
            </UFormGroup>
            <UFormGroup name="partus">
              <UInput placeholder="partus" v-model="state.partus"/>
            </UFormGroup>
            <UFormGroup name="abortus">
              <UInput placeholder="abortus" v-model="state.abortus"/>
            </UFormGroup>
          </div>
        </div>
        
        <div class="flex flex-col gap-3 items-center justify-center w-full xl:max-w-max">
          <p class="text-center font-semibold text-sm">Onset Kontraksi</p>
          <URadioGroup :loading="optionLoading" value-attribute="value" :options="[{ value: 'spontan', label: 'Timbul Spontan' }, { value: 'induksi', label: 'Dengan Induksi' }, { value: 'non_spontan_non_induksi', label: 'SC Tanpa Kontraksi/Induksi' }]" v-model="state.onset_kontraksi"/>
        </div>
      </div>

      <!-- INFO : Cek `rsia_grouping_chunks` tabel -->
      <!-- TODO : Lanjutkan Pembuatan Forms JAMPERSAL -->

      <UDivider />

      <div class="flex justify-end gap-3 pt-5">
        <UButton type="submit" :loading="isLoading">Submit</UButton>
      </div>
    </UForm>
  </div>
</template>
