<script lang="ts" setup>
  import type { SepData } from '~/types/sep'

  const form$ = ref({} as any)
  const { sep } = defineProps<{
    sep: SepData
  }>();

  onMounted(() => {
    form$.value.update({
      jenis_rawat: sep.jnspelayanan,
    })
  })
</script>

<template>
  <Vueform ref="form$" size="sm" :display-errors="false">
    <StaticElement name="h3" tag="h3" content="Klaim Form" description="Form Klaim INA-CBGs" />
    <GroupElement name="container_1">
      <GroupElement name="jaminan" :columns="{ container: 3 }">
        <SelectElement name="select" :search="true" :native="false" label="Jaminan / Cara Bayar" input-type="search" autocomplete="off" items="http://localhost:3000/cara_bayar.json" />
      </GroupElement>
      <GroupElement name="column2" :columns="{ container: 3 }">
        <!-- console the value -->
        <TextElement name="no_peserta" label="No. Peserta" v-on:change="(a: any) => console.log(a)" />
      </GroupElement>
      <GroupElement name="column3" :columns="{ container: 3 }">
        <TextElement name="no_sep" label="No. SEP" />
      </GroupElement>
      <GroupElement name="column4" :columns="{ container: 3 }">
        <SelectElement name="cob" :search="true" :native="false" label="COB" input-type="search" autocomplete="off" items="http://localhost:3000/cob.json" value-prop="value" label-prop="label" />
      </GroupElement>
    </GroupElement>
    <GroupElement name="container_2" class="mt-4">
      <GroupElement name="column1" :columns="{ container: 3 }">
        <RadiogroupElement name="jenis_rawat" id="jenis_rawat" field-name="jenis_rawat" view="tabs" label="Jenis Rawat" :items="[
          { value: '2', label: 'Rawat Jalan' },
          { value: '1', label: 'Rawat Inap' },
        ]" />
      </GroupElement>
      <GroupElement name="column2" :columns="{ container: 6 }">
        <CheckboxgroupElement name="jenis_rawat_1" view="tabs" label="Jenis Rawat" :items="[
          { value: '0', label: 'Naik / Turun Kelas' },
          { value: '1', label: 'Ada Rawat Intensif' },
        ]" :conditions="[
          ['container_2.column1.jenis_rawat', 'in', ['1',],],
          ['container_1.jaminan.select', 'not_in', ['00076',],],
        ]" />
        <CheckboxgroupElement name="jenis_rawat_3" view="tabs" label="Jenis Rawat" :items="[
          { value: '1', label: 'Ada Rawat Intensif' },
        ]" :conditions="[
          ['container_2.column1.jenis_rawat', 'in', ['1',],],
          ['container_1.jaminan.select', 'in', ['00076',],],
        ]" :columns="{ container: 6 }" />
        <CheckboxgroupElement name="jenis_rawat_2" view="tabs" label="Jenis Rawat" :conditions="[
          ['container_2.column1.jenis_rawat', 'in', ['2',],],
          ['container_1.jaminan.select', 'not_in', ['00076',],],
        ]" :items="[
          { value: '0', label: 'Kelas Ekslusif' },
        ]" :columns="{ container: 6 }" />
      </GroupElement>
      <GroupElement name="column3" :columns="{ container: 3 }">
        <RadiogroupElement name="kelas_hak" view="tabs" label="Kelas Hak" :items="[
          { value: '3', label: 'Kelas 3' },
          { value: '2', label: 'Kelas 2' },
          { value: '1', label: 'kelas 1' },
        ]" :conditions="[
          ['container_2.column1.jenis_rawat', 'in', ['1',],],
        ]" />
      </GroupElement>
    </GroupElement>
    <GroupElement name="container_3" class="mt-3" label="<b>Tanggal Rawat</b>">
      <GroupElement name="column1" :columns="{ container: 4 }">
        <DateElement name="tgl_masuk" label="Masuk" :time="true" default="2024-05-21 12:00" min="2024-05-08 00:00"
          :addons="{ before: '📆' }" />
      </GroupElement>
      <GroupElement name="column2" :columns="{ container: 4 }">
        <DateElement name="tgl_keluar" label="Keluar" :time="true" default="2024-05-21 12:00" :conditions="[
          ['container_2.column1.jenis_rawat', 'in', ['1',],],
        ]" :addons="{ before: '📆' }" />
      </GroupElement>
      <GroupElement name="column3" :columns="{ container: 4 }">
        <TextElement name="umur" input-type="number" :rules="[ 'nullable', 'min:0', 'numeric' ]" autocomplete="off" label="Umur" :readonly="true" info="Umur Dalam bulan" />
      </GroupElement>
      <SelectElement name="cara_masuk" items="http://localhost:3000/cara_masuk.json" :search="true" :native="false" label="Cara Masuk" input-type="search" autocomplete="off" :default="0" :columns="{ container: 6 }" />
    </GroupElement>
    <StaticElement name="divider_1" tag="hr" top="1" bottom="1" />
    <RadiogroupElement name="kelas_pelayanan" view="tabs" label="Kelas Pelayanan" :items="[
      { value: '3', label: 'Kelas 3' },
      { value: '2', label: 'Kelas 2' },
      { value: '1', label: 'Kelas 1' },
      { value: '0', label: 'Diatas Kelas 1' },
    ]" :conditions="[
      ['container_2.column2.jenis_rawat_1', 'in', ['0',],],
    ]" />
    <GroupElement name="container3_6" :conditions="[
      ['container_2.column2.jenis_rawat_1', 'in', ['1',],],
    ]">
      <GroupElement name="column1" :columns="{ container: 2 }">
        <CheckboxgroupElement name="ventilator" view="tabs" label="Ventilator" :items="[
          { value: '1', label: 'Ya' },
        ]" />
      </GroupElement>
      <GroupElement name="column2" :columns="{ container: 5 }" :conditions="[
        ['container3_6.column1.ventilator', 'in', ['1',],],
      ]">
        <DateElement name="intubasi" label="Intubasi" :time="true" :addons="{ before: '📆' }" />
      </GroupElement>
      <GroupElement name="column3" :columns="{ container: 5 }" :conditions="[
        ['container3_6.column1.ventilator', 'in', ['1',],],
      ]">
        <DateElement name="ekstubasi " label="Ekstubasi " :time="true" :addons="{ before: '📆' }" />
      </GroupElement>
    </GroupElement>
    <StaticElement name="divider_3" tag="hr" top="1" bottom="1" :conditions="[
      ['container_2.column2.jenis_rawat_1', 'in', ['0', '1',],],
    ]" />
    <GroupElement name="container_4">
      <GroupElement name="container_4_1" label="<b>LOS</b>">
        <GroupElement name="column1" :columns="{
          default: { container: 4 },
          lg: { container: 6 },
        }">
          <TextElement name="los_hari" input-type="number" :rules="[
            'nullable',
            'min:0',
            'numeric',
          ]" autocomplete="off" label="HARI" info="LOS Dalam hari" :addons="{ after: 'Hari' }" />
        </GroupElement>
        <GroupElement name="column2" :columns="{
          default: { container: 4 },
          lg: { container: 3 },
        }">
          <TextElement name="los_jam" label="JAM" input-type="time" />
        </GroupElement>
        <GroupElement name="column2_1" :columns="{
          default: { container: 4 },
          lg: { container: 3 },
        }">
          <TextElement name="berat_lahir" input-type="number" :rules="[
            'nullable',
            'min:0',
            'numeric',
          ]" autocomplete="off" label="Berat lahir" info="Berat lahir dalam gram" :addons="{ after: 'gram' }" />
        </GroupElement>
      </GroupElement>
      <GroupElement name="container_4_2">
        <StaticElement name="p_2" tag="p" class="mt-3" content="<b>ADL Score</b>" />
        <GroupElement name="column1" :columns="{ container: 4 }">
          <TextElement name="sub_acute" label="Sub Acute" />
        </GroupElement>
        <GroupElement name="column2" :columns="{ container: 4 }">
          <TextElement name="chronic" label="Chronic" />
        </GroupElement>
        <GroupElement name="column3" :columns="{ container: 4 }">
          <SelectElement name="cara_pulang" items="http://localhost:3000/cara_pulang.json" :search="true" :native="false" label="Cara Pulang" input-type="search" autocomplete="off" />
        </GroupElement>
      </GroupElement>
      <GroupElement class="mt-3" name="container_4_3">
        <GroupElement name="column1" :columns="{ container: 6 }">
          <SelectElement name="dpjp" items="http://localhost:3000/dpjp.json" :search="true" :native="false" label="DPJP" input-type="search" autocomplete="off" />
        </GroupElement>
        <GroupElement name="column2" :columns="{ container: 6 }">
          <SelectElement name="jenis_tarif" items="http://localhost:3000/jenis_tarif.json" :search="true" :native="false" label="Jenis Tarif" input-type="search" autocomplete="off" />
        </GroupElement>
      </GroupElement>
    </GroupElement>
    <StaticElement name="divider" tag="hr" bottom="1" top="1" :conditions="[
      ['container_1.jaminan.select', 'not_in', ['00076',],],
    ]" />
    <GroupElement name="container2" :conditions="[
      ['container_1.jaminan.select', 'not_in', ['00076',],],
    ]">
      <GroupElement name="column1" :columns="{ container: 2 }">
        <RadiogroupElement name="pasien_tb" view="tabs" label="Pasien TB" :items="[
          { value: '1', label: 'Ya' },
          { value: '0', label: 'Tidak' },
        ]" default="0" />
      </GroupElement>
      <GroupElement name="column2" :columns="{ container: 10 }">
        <GroupElement name="container2_2" :conditions="[
          ['container2.column1.pasien_tb', 'in', ['1',],],
        ]">
          <GroupElement class="mt-[22px]" name="column1" :columns="{ container: 12 }">
            <TextElement name="no_sitb" placeholder="No. REG SITB" :columns="{ container: 10 }" />
            <ButtonElement name="validasi_sitb" button-label="Validasi" :secondary="true" :full="true"
              :columns="{ container: 2 }" />
          </GroupElement>
        </GroupElement>
      </GroupElement>
    </GroupElement>
    <GroupElement class="mt-4" name="container2_1" :conditions="[
      ['container_2.column1.jenis_rawat', 'in', ['1',],],
      ['container_1.jaminan.select', 'not_in', ['00076',],
      ],
    ]">
      <GroupElement name="column1_1" :columns="{ container: 2 }">
        <RadiogroupElement name="co_ins_cov19" view="tabs" :items="[
          { value: '1', label: 'Ya' },
          { value: '0', label: 'Tidak' },
        ]" default="0" label="Co-Insidense COVID-19	" />
      </GroupElement>
      <GroupElement name="column2_2" :columns="{ container: 10 }">
        <GroupElement name="container2_3" :conditions="[
          ['container2_1.column1_1.co_ins_cov19', 'in', ['1',],],
        ]">
          <GroupElement class="mt-[22px]" name="column1" :columns="{ container: 12 }">
            <TextElement name="no_claim_cov19" placeholder="No. CLAIM COVID 19" :columns="{ container: 10 }" />
            <ButtonElement name="validasi_co-ins-cov19" button-label="Validasi" :secondary="true" :full="true"
              :columns="{ container: 2 }" />
          </GroupElement>
        </GroupElement>
      </GroupElement>
    </GroupElement>
    <GroupElement name="container" :conditions="[
      ['container_2.column2.jenis_rawat_2', 'in', ['0',],],
    ]">
      <TextElement name="Tarif Poli Eks" input-type="number" :rules="['nullable', 'min:0', 'numeric',]" autocomplete="off" label="Tarif Poli Eks." :addons="{ before: 'Rp' }" />
    </GroupElement>
    <StaticElement name="divider_2" tag="hr" bottom="1" top="1" />
    <StaticElement name="h3_1" tag="h3" content="Tarif Rumah Sakit" />
    <CheckboxElement name="checkbox"
      text="Menyatakan benar bahwa data tarif yang tersebut di atas adalah benar sesuai dengan kondisi yang sesungguhnya."
      :default="true" :rules="['accepted',]" :disabled="true" />
    <GroupElement class="mb-3" name="container3_5">
      <GroupElement name="column1_6" :columns="{ container: 4 }">
        <TextElement name="Prosedur Non Bedah" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Prosedur Non Bedah" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column2_7" :columns="{ container: 4 }">
        <TextElement name="Prosedur Bedah" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Prosedur Bedah" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column3_5" :columns="{ container: 4 }">
        <TextElement name="Konsultasi" input-type="number" :rules="['nullable', 'min:0', 'numeric',]" autocomplete="off"
          label="Konsultasi" :addons="{ before: 'Rp' }" />
      </GroupElement>
    </GroupElement>
    <GroupElement class="mb-3" name="container3">
      <GroupElement name="column1_7" :columns="{ container: 4 }">
        <TextElement name="Tenaga Ahli_1" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Tenaga Ahli" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column2_8" :columns="{ container: 4 }">
        <TextElement name="Keperawatan_1" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Keperawatan" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column3_6" :columns="{ container: 4 }">
        <TextElement name="Penunjang" input-type="number" :rules="['nullable', 'min:0', 'numeric',]" autocomplete="off"
          label="Penunjang" :addons="{ before: 'Rp' }" />
      </GroupElement>
    </GroupElement>
    <GroupElement class="mb-3" name="container3_4">
      <GroupElement name="column1_5" :columns="{ container: 4 }">
        <TextElement name="Radiologi" input-type="number" :rules="['nullable', 'min:0', 'numeric',]" autocomplete="off"
          label="Radiologi" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column2_6" :columns="{ container: 4 }">
        <TextElement name="Laboratorium" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Laboratorium" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column3_4" :columns="{ container: 4 }">
        <TextElement name="Pelayanan Darah" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Pelayanan Darah" :addons="{ before: 'Rp' }" />
      </GroupElement>
    </GroupElement>
    <GroupElement class="mb-3" name="container3_3">
      <GroupElement name="column1_4" :columns="{ container: 4 }">
        <TextElement name="Rehabilitasi" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Rehabilitasi" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column2_5" :columns="{ container: 4 }">
        <TextElement name="Kamar / Akomodasi" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Kamar / Akomodasi" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column3_3" :columns="{ container: 4 }">
        <TextElement name="Rawat Intensif" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Rawat Intensif" :addons="{ before: 'Rp' }" />
      </GroupElement>
    </GroupElement>
    <GroupElement class="mb-3" name="container3_2">
      <GroupElement name="column1_3" :columns="{ container: 4 }">
        <TextElement name="Obat" input-type="number" :rules="['nullable', 'min:0', 'numeric',]" autocomplete="off"
          label="Obat" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column2_4" :columns="{ container: 4 }">
        <TextElement name="Obat Kronis" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Obat Kronis" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column3_2" :columns="{ container: 4 }">
        <TextElement name="Obat Kemoterapi" input-type="number" :rules="['nullable', 'min:0', 'numeric',]"
          autocomplete="off" label="Obat Kemoterapi" :addons="{ before: 'Rp' }" />
      </GroupElement>
    </GroupElement>
    <GroupElement class="mb-3" name="container3_1">
      <GroupElement name="column1_2" :columns="{ container: 4 }">
        <TextElement name="Alkes" input-type="number" :rules="['nullable', 'min:0', 'numeric',]" autocomplete="off"
          label="Alkes" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column2_3" :columns="{ container: 4 }">
        <TextElement name="BMHP" input-type="number" :rules="['nullable', 'min:0', 'numeric',]" autocomplete="off"
          label="BMHP" :addons="{ before: 'Rp' }" />
      </GroupElement>
      <GroupElement name="column3_1" :columns="{ container: 4 }">
        <TextElement name="Sewa Alat" input-type="number" :rules="['nullable', 'min:0', 'numeric',]" autocomplete="off"
          label="Sewa Alat" :addons="{ before: 'Rp' }" />
      </GroupElement>
    </GroupElement>
    <StaticElement name="divider_7" tag="hr" top="1" bottom="1" :conditions="[
      ['container_1.jaminan.select', 'in', ['00076',],],
    ]" />
    <GroupElement name="container_6" :conditions="[
      ['container_1.jaminan.select', 'in', ['00076',],],
    ]">
      <MultifileElement name=" Resume Medis" label="Resume Medis" :urls="{}" />
      <MultifileElement name="Bukti Penerimaan Layanan" label="Bukti Penerimaan Layanan" :urls="{}" />
      <MultifileElement name="Laporan Operasi" label="Laporan Operasi" :urls="{}" />
      <GroupElement name="container2_5">
        <GroupElement name="column1" :columns="{ container: 9 }" />
        <GroupElement name="column2" :columns="{ container: 3 }">
          <ButtonElement name="secondaryButton_1" button-label="Sinkronisasi Semua Berkas" :secondary="true"
            :full="true" />
        </GroupElement>
      </GroupElement>
    </GroupElement>
    <StaticElement name="divider_4" tag="hr" bottom="1" top="1" />
    <StaticElement name="h3_2" tag="h3" content="Coding Grouper" />
    <RadiogroupElement name="unu_ina" view="tabs" :columns="{ container: 5 }" :items="[
      { value: 'UNU', label: 'Coding UNU Grouper' },
      { value: 'INA', label: 'Coding INA Grouper' },
    ]" default="UNU" />
    <GroupElement name="container_5">
      <GroupElement name="unu_container" :conditions="[
        ['unu_ina', 'in', ['UNU',],],
      ]">
        <StaticElement name="h4" tag="h4" content="UNU Grouper"
          description="Grouper casemix yang dikembangkan oleh United Nations University (UNU)." />
      </GroupElement>
      <GroupElement name="ina_container" :conditions="[
        ['unu_ina', 'in', ['INA',],],
      ]">
        <StaticElement name="h4_1" tag="h4" content="INA Grouper" description="Sistem pengelompokan baru untuk diagnosis dan penyakit yang disesuaikan dengan kondisi di Indonesia." />
      </GroupElement>
    </GroupElement>
    <StaticElement name="divider_5" tag="hr" bottom="1" top="1" />
    <StaticElement name="h3_3" tag="h3" content="Data Klinis" description="Tekanan Darah (mmHg):" />
    <GroupElement name="container2_4">
      <GroupElement name="column1" :columns="{ container: 6 }">
        <TextElement name="Sistole" input-type="number" :rules="['nullable','numeric' ]" autocomplete="off" label="Sistole" default="0" />
      </GroupElement>
      <GroupElement name="column2" :columns="{ container: 6 }">
        <TextElement name="Diastole" input-type="number" :rules="['nullable','numeric' ]" autocomplete="off" label="Diastole" default="0" />
      </GroupElement>
    </GroupElement>
    <GroupElement name="container_7" :conditions="[
      ['container_1.jaminan.select', 'in', ['00076',],],
    ]">
      <StaticElement name="divider_8" tag="hr" bottom="1" />
      <GroupElement name="container2_6">
        <GroupElement name="column1" :columns="{ container: 6 }">
          <TextareaElement name="Anamnesa" label="Anamnesa" />
        </GroupElement>
        <GroupElement name="column2" :columns="{ container: 6 }">
          <TextareaElement name="Indikasi Rawat Inap" label="Indikasi Rawat Inap" />
        </GroupElement>
      </GroupElement>
      <GroupElement name="container2_8">
        <GroupElement name="column1_9" :columns="{ container: 6 }">
          <TextareaElement name="Diagnosa Primer" label="Diagnosa Primer" />
        </GroupElement>
        <GroupElement name="column2_10" :columns="{ container: 6 }">
          <TextareaElement name="Diagnosa Sekunder" label="Diagnosa Sekunder" />
        </GroupElement>
      </GroupElement>
      <GroupElement name="container2_7">
        <GroupElement name="column1_8" :columns="{ container: 6 }">
          <TextareaElement name="Prosedur" label="Prosedur" />
        </GroupElement>
        <GroupElement name="Operasi" :columns="{ container: 6 }">
          <TextElement name="nama_operasi" label="Nama Operasi" />
          <TextareaElement name="laporan_operasi" label="Laporan Operasi" />
        </GroupElement>
      </GroupElement>
    </GroupElement>
    <StaticElement name="divider_6" tag="hr" top="3" />
    <GroupElement name="container4">
      <GroupElement name="column1" :columns="{ container: 2 }">
        <ButtonElement name="dangerButton" button-label="Hapus" :danger="true" :full="true" />
      </GroupElement>
      <GroupElement name="column2" :columns="{ container: 6 }" />
      <GroupElement name="column3" :columns="{ container: 2 }">
        <ButtonElement name="secondaryButton" button-label="Simpan" :secondary="true" :full="true" />
      </GroupElement>
      <GroupElement name="column4" :columns="{ container: 2 }">
        <ButtonElement name="submit" button-label="Grouper" :submits="true" :full="true" />
      </GroupElement>
    </GroupElement>
  </Vueform>
</template>