export type Diagnosa = {
  'no_rawat': string;
  'kd_penyakit': string;
  'status': "Ranap" | "Ralan";
  'prioritas': number;
  'status_penyakit'?: "Lama" | "Baru";
  'penyakit'?: {
    'kd_penyakit': string;
    'nm_penyakit': string;
    'ciri_ciri': string;
    'keterangan': string;
    'kd_ktg': string;
    'status': string;
  }
}

export type DiagnosaData = {
  data: Diagnosa[];
};