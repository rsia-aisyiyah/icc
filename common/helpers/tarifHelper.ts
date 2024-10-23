import type { FormData } from "~/types";

export const getTotalTarifRS = (state: FormData) => {
  const nominalKey = [
    "prosedur_non_bedah",
    "prosedur_bedah",
    "konsultasi",
    "tenaga_ahli",
    "keperawatan",
    "penunjang",
    "radiologi",
    "laboratorium",
    "pelayanan_darah",
    "rehabilitasi",
    "kamar",
    "rawat_intensif",
    "obat",
    "obat_kronis",
    "obat_kemoterapi",
    "alkes",
    "bmhp",
    "sewa_alat"
  ];

  // get nominal value from state and sum it
  return nominalKey.reduce((acc, key) => {
    const value = state[key];
    return acc + (value !== undefined && value !== '' ? Number(value.replace(/\.|,/g, '')) : 0);
  }, 0);
}