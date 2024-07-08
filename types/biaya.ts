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
  radiologi: number;
  laboratorium: number;
  kamar: number;
  obat: number;
  obat_kronis: number;
  obat_kemoterapi: number;
  bmhp: number;
  sewa_alat: number;
  rehabilitasi: number;
}

export type BillingPasienResponse = {
  data: BillingPasien;
};