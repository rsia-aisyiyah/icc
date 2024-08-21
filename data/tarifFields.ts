interface TarifField {
  label: string;
  name: string;
}

export const tarifFields: TarifField[] = [
  { label: 'Prosedur Non Bedah', name: 'prosedur_non_bedah' },
  { label: 'Prosedur Bedah', name: 'prosedur_bedah' },
  { label: 'Konsultasi', name: 'konsultasi' },
  { label: 'Tenaga Ahli', name: 'tenaga_ahli' },
  { label: 'Keperawatan', name: 'keperawatan' },
  { label: 'Penunjang', name: 'penunjang' },
  { label: 'Radiologi', name: 'radiologi' },
  { label: 'Laboratorium', name: 'laboratorium' },
  { label: 'Pelayanan Darah', name: 'pelayanan_darah' },
  { label: 'Rehabilitasi', name: 'rehabilitasi' },
  { label: 'Kamar', name: 'kamar' },
  { label: 'Rawat Intensif', name: 'rawat_intensif' },
  { label: 'Obat', name: 'obat' },
  { label: 'Obat Kronis', name: 'obat_kronis' },
  { label: 'Obat Kemoterapi', name: 'obat_kemoterapi' },
  { label: 'Alkes', name: 'alkes' },
  { label: 'BMHP', name: 'bmhp' },
  { label: 'Sewa Alat', name: 'sewa_alat' }
];
