// ==============================
export type TensiData = {
  'tensi': string;
}

export type ResponseTensi = {
  data: TensiData;
};

// ==============================
export type RegPeriksa = {
  no_reg: string;
  no_rawat: string;
  tgl_registrasi: string;
  jam_reg: string;
  kd_dokter: string;
  no_rkm_medis: string;
  kd_poli: string;
  p_jawab: string;
  almt_pj: string;
  hubunganpj: string;
  biaya_reg: number;
  stts: string;
  stts_daftar: string;
  status_lanjut: string;
  kd_pj: string;
  umurdaftar: number;
  sttsumur: string;
  status_bayar: string;
  status_poli: string;
  pasien_bayi?: PasienBayi;
}

export type ResponseRegPeriksa = {
  data: RegPeriksa;
}

export type PasienBayi = {
  no_rkm_medis: string;
  berat_badan?: number;
  anakke?: string;
  keterangan?: string;
  diagnosa?: string;
};

// ==============================
export type SepData = {
  no_sep: string;
  no_rawat: string;
  tglsep: string;
  tglrujukan: string;
  no_rujukan: string;
  kdppkrujukan: string;
  nmppkrujukan: string;
  kdppkpelayanan: string;
  nmppkpelayanan: string;
  jnspelayanan: number;
  catatan: string;
  diagawal: string;
  nmdiagnosaawal: string;
  kdpolitujuan: string;
  nmpolitujuan: string;
  klsrawat: number;
  klsnaik: string;
  pembiayaan: string;
  pjnaikkelas: string;
  lakalantas: string;
  user: string;
  nomr: string;
  nama_pasien: string;
  tanggal_lahir: string;
  peserta: string;
  jkel: string;
  no_kartu: string;
  tglpulang: string;
  asal_rujukan: string;
  eksekutif: string;
  cob: string;
  notelep: string;
  katarak: string;
  tglkkl: string;
  keterangankkl: string;
  suplesi: string;
  no_sep_suplesi: string;
  kdprop: string;
  nmprop: string;
  kdkab: string;
  nmkab: string;
  kdkec: string;
  nmkec: string;
  noskdp: string;
  kddpjp: string;
  nmdpdjp: string;
  tujuankunjungan: string;
  flagprosedur: string;
  penunjang: string;
  asesmenpelayanan: string;
  kddpjplayanan: string;
  nmdpjplayanan: string;
}

export type ResponseSepData = {
  data: SepData;
}

// ==============================
export type KamarInapDetail = {
  no_rawat: string;
  kd_kamar: string;
  trf_kamar: number;
  diagnosa_awal: string;
  diagnosa_akhir: string;
  tgl_masuk: string;
  jam_masuk: string;
  tgl_keluar: string;
  jam_keluar: string;
  lama: number;
  ttl_biaya: number;
  stts_pulang: string;
}

export type KamarInap = {
  lama_inap: number;
  lama_jam: string;
  detail: KamarInapDetail[];
}

export type KamarInapResponse = {
  data: KamarInap
}

// ==============================
export type Prosedur = {
  'no_rawat'?: string;
  'kode'?: string;
  'status'?: "Ranap" | "Ralan";
  'prioritas'?: number;
  'penyakit'?: {
    'kode'?: string;
    'deskripsi_panjang'?: string;
    'deskripsi_pendek'?: string;
  }
}

// ==============================
export type Diagnosa = {
  'no_rawat'?: string;
  'kd_penyakit'?: string;
  'status'?: "Ranap" | "Ralan";
  'prioritas'?: number;
  'status_penyakit'?: "Lama" | "Baru";
  'penyakit'?: {
    'kd_penyakit'?: string;
    'nm_penyakit'?: string;
    'ciri_ciri'?: string;
    'keterangan'?: string;
    'kd_ktg'?: string;
    'status'?: string;
  }
}

export type DiagnosaData = {
  data: Diagnosa[];
};

// ==============================
// ==================== REAL COST RAWAT INAP 
export type RealCostRawatInap = {
  detail_pemberian_obat: number;
  kamar_inap: number;
  operasi: number;
  periksa_lab: number;
  periksa_radiologi: number;
  rawat_inap_dr_pr: number;
  rawat_inap_pr: number;
  rawat_inap_dr: number;
  rawat_jalan_dr_pr: number;
  rawat_jalan_pr: number;
  rawat_jalan_dr: number;
  total: number;
  gabung?: Partial<RealCostRawatInap>;
};

export type RealCostByNoRawat = {
  [key: string]: RealCostRawatInap;
};

export type RealCostRawatInapResponse = {
  data: RealCostByNoRawat;
};

// ==================== GROUPING RAWAT INAP 
export type GroupingCostRawatInap = {
  no_sep: string;
  code_cbg: string;
  deskripsi: string;
  tarif: number;
};

export type GroupingCostRawatInapResponse = {
  data: GroupingCostRawatInap[];
};


// ==================== BILLING PASIEN
export type BillingPasien = {
  prosedur_non_bedah: number;
  prosedur_bedah: number;
  konsultasi: number;
  tenaga_ahli: number;
  keperawatan: number;
  penunjang: number;
  radiologi: number;
  laboratorium: number;
  pelayanan_darah: number;
  rehabilitasi: number;
  kamar: number;
  rawat_intensif: number;
  obat: number;
  obat_kronis: number;
  obat_kemoterapi: number;
  alkes: number;
  bmhp: number;
  sewa_alat: number;
}

export type BillingPasienResponse = {
  data: BillingPasien;
};

// ==============================
export type ResourcePagination = {
  data: any[],
  links: ResourcePaginationLinks,
  meta: ResourcePaginationMeta
}

type ResourcePaginationLinks = {
  first: string;
  last: string;
  prev: string | null;
  next: string | null;
};

export type ResourcePaginationMeta = {
  current_page: number;
  from: number;
  last_page: number;
  links: ResourcePaginationMetaLink[];
  path: string;
  per_page: number;
  to: number;
  total: number;
}

type ResourcePaginationMetaLink = {
  url: string | null;
  label: string;
  active: boolean;
};