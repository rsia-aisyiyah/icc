import { z } from 'zod'

export const FormDataSchema = z.object({
  payor_label: z.string().min(1, "Jaminan / Cara Bayar haris dipilih"),
  payor_id: z.string().min(1, "Jaminan / Cara Bayar haris dipilih"),
  payor_cd: z.string().min(1, "Jaminan / Cara Bayar haris dipilih"),
  nomor_kartu: z.string(),
  nomor_sep: z.string(),
  cob_cd: z.string().optional().nullable(),
  jenis_rawat: z.number().int().refine(value => [1, 2, 3].includes(value), { message: 'Jenis rawat tidak valid' }).optional().nullable(),
  upgrade_class_ind: z.boolean().optional().nullable(),
  icu_indikator: z.boolean().optional().nullable(),
  executive_class_ind: z.boolean().optional().nullable(),
  tariff_class: z.number().int().refine(value => [1, 2, 3].includes(value), { message: 'Kelas hak tidak valid' }).optional().nullable(),
  tgl_masuk: z.date().optional().nullable(),
  tgl_pulang: z.date().optional().nullable(),
  age: z.number().int().min(0).optional().nullable(),
  cara_masuk: z.string().min(1).optional().nullable(),
  los: z.number().int().min(0).optional().nullable(),
  los_in_hour: z.string().optional().nullable(),
  birth_weight: z.number().int().min(0).optional().nullable(),
  adl_sub_acute: z.number().int().min(12).max(60).optional().nullable(),
  adl_chronic: z.number().int().min(12).max(60).optional().nullable(),
  discharge_status: z.number().int().optional().nullable(),
  nama_dokter: z.string().optional().nullable(),
  kode_tarif: z.string().optional().nullable(),
  jkn_sitb_checked_ind: z.boolean().optional().nullable(),
  co_insidence_ind_jkn: z.boolean().optional().nullable(),
  upgrade_class_class: z.string().optional().nullable(),
  upgrade_class_payor: z.string().optional().nullable(),
  upgrade_class_los: z.string().optional().nullable(),
  use_ind: z.boolean().optional().nullable(),
  start_dttm: z.date().optional().nullable(),
  stop_dttm: z.date().optional().nullable(),
  icu_los: z.number().int().min(0).optional().nullable(),
  tarif_poli_eks: z.number().int().min(0),

  prosedur_non_bedah: z.string().min(0).optional().nullable(),
  prosedur_bedah: z.string().min(0).optional().nullable(),
  konsultasi: z.string().min(0).optional().nullable(),
  tenaga_ahli: z.string().min(0).optional().nullable(),
  keperawatan: z.string().min(0).optional().nullable(),
  penunjang: z.string().min(0).optional().nullable(),
  radiologi: z.string().min(0).optional().nullable(),
  laboratorium: z.string().min(0).optional().nullable(),
  pelayanan_darah: z.string().min(0).optional().nullable(),
  rehabilitasi: z.string().min(0).optional().nullable(),
  kamar: z.string().min(0).optional().nullable(),
  rawat_intensif: z.string().min(0).optional().nullable(),
  obat: z.string().min(0).optional().nullable(),
  obat_kronis: z.string().min(0).optional().nullable(),
  obat_kemoterapi: z.string().min(0).optional().nullable(),
  alkes: z.string().min(0).optional().nullable(),
  bmhp: z.string().min(0).optional().nullable(),
  sewa_alat: z.string().min(0).optional().nullable(),

  sistole: z.string().min(0).optional().nullable(),
  diastole: z.string().min(0).optional().nullable(),

  diagnosa_inagrouper: z.array(z.string().refine(value => value.length > 0, { message: 'Diagnosa harus dipilih' })).optional().nullable(),
  procedure_inagrouper: z.array(z.string().refine(value => value.length > 0, { message: 'Diagnosa harus dipilih' })).optional().nullable(),

  usia_kehamilan: z.number().int().min(0).optional().nullable(),
  gravida: z.string().optional().nullable(),
  partus: z.string().optional().nullable (),
  abortus: z.string().optional().nullable(),
  onset_kontraksi: z.enum(['spontan', 'induksi', 'non_spontan_non_induksi']).optional().nullable(),
})