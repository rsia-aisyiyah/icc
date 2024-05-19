export type DetailBiayaRanap = {
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
  gabung?: Partial<DetailBiayaRanap>;
};

export type BiayaByNoRawat = {
  [key: string]: DetailBiayaRanap;
};

export type BiayaRanapResponse = {
  data: BiayaByNoRawat;
};
