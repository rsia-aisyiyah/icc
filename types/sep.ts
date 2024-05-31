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
  jnspelayanan: string;
  catatan: string;
  diagawal: string;
  nmdiagnosaawal: string;
  kdpolitujuan: string;
  nmpolitujuan: string;
  klsrawat: string;
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