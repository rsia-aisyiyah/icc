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

export type PasienBayi = {
  no_rkm_medis: string;
  berat_badan?: string;
  anakke?: string;
  keterangan?: string;
  diagnosa?: string;
};

export type ResponseRegPeriksa = {
  data: RegPeriksa;
}