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
