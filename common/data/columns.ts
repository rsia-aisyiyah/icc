export const pasienRanapColumns = [
  { label: "Data Pasien", key: "sep.no_sep" },
  // { label: "Pasien", key: "pasien.nm_pasien" },
  { label: "Status", key: "status_klaim" },
  { label: "Diag Awal", key: "diagnosa" },
  { label: "Tgl Masuk", key: "reg_periksa?.tgl_registrasi" },
  { label: "Tgl Keluar", key: "tgl_keluar" },
  { label: "Real Cost", key: "real_cost" },
  { label: "Hasil Group", key: "groupping_tarif" },
  // { label: "Mining tarif", key: "mining_tarif" },
  { label: "Action", key: "action" },
];

export const dataSepColumns = [
  { label: "No. SEP", key: "no_sep" },
  // { label: "No. Rawat", key: "no_rawat" },
  // { label: "Pasien", key: "nama_pasien" },
  // { label: "Peserta", key: "peserta" },
  { label: "Status", key: "status_klaim.status" },
  { label: "Status Rawat", key: "jnspelayanan" },
  { label: "No Kartu", key: "no_kartu" },
  // { label: "Diagnosa Awal", key: "nmdiagnosaawal" },
  { label: "Tgl Masuk", key: "reg_periksa?.tgl_registrasi" },
  { label: "Tgl Keluar", key: "tanggal_pulang" },
  { label: "CBG", key: "group_stage?.code_cbg" },
  { label: "Hasil Group", key: "group_stage?.tarif" },
  { label: "Action", key: "action" }
];