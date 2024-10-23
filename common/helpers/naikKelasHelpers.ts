// {diisi jika naik kelas rawat, 1. VVIP, 2. VIP, 3. Kelas 1, 4. Kelas 2, 5. Kelas 3, 6. ICCU, 7. ICU, 8. Diatas Kelas 1}
const setKelas = [
  { code: 1, label: 'VVIP', value: "vvip" },
  { code: 2, label: 'VIP', value: "vip" },
  { code: 3, label: 'Kelas 1', value: "kelas_1" },
  { code: 4, label: 'Kelas 2', value: "kelas_2" },
  { code: 5, label: 'Kelas 3', value: "kelas_3" },
  { code: 6, label: 'ICCU', value: "iccu" },
  { code: 7, label: 'ICU', value: "icu" },
  { code: 8, label: 'Diatas Kelas 1', value: "diatas_kelas_1" },
];

const determineKelas = (kelas: number|string|undefined) => {
  if (kelas === undefined) return undefined;
  return setKelas.find((item) => item.code == kelas);
}

export { determineKelas }