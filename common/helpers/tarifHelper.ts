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
  const nominal = nominalKey.reduce((acc, key) => {
    const value = state[key];
    const numberValue = Number(value.replaceAll(".", "").replaceAll(",", "."));
    return acc + (!isNaN(numberValue) ? numberValue : 0);
  }, 0);

  return nominal;
}