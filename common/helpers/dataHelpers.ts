import type { KamarInap } from "~/types";
import { useAsyncData } from 'nuxt/app';
import { useDebounceFn } from '@vueuse/core';

// export interface DPJPData {
//   value: string;
//   label: string;
// }

// export const getDpjp = async (search: string | undefined): Promise<DPJPData | undefined> => {
//   if (!search) {
//     return undefined;
//   }  

//   try {
//     const response = await fetch('/dpjp.json');
//     if (!response.ok) {
//       return undefined;
//     }

//     search = search.toUpperCase();

//     const dpjpData: DPJPData[] = await response.json();
//     const find = dpjpData.find((item: DPJPData) => item.label == search || item.value == search);
//     return find;
//   } catch (error) {
//     console.error('Failed to fetch DPJP data:', error);
//     return undefined;
//   }
// };

// int to rp
export const formatCurrency = (value: number): string => {
  const currencyCode = "IDR"
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: currencyCode, minimumFractionDigits: 0, currencyDisplay: "code" }).format(value).replace(currencyCode, '').trim();
};

// curenncy to int 
export const currencyToInt = (value: string): number => {
  return parseInt(value.replace(/\D/g, ''));
};

export const getTanggalKeluar = (kamarInap: KamarInap) => {
  const filteredDetails = kamarInap?.detail?.filter(detail => detail.stts_pulang !== "Pindah Kamar") || [];

  if (filteredDetails.length > 0) {
    return filteredDetails[0].tgl_keluar + ' ' + filteredDetails[0].jam_keluar;
  }

  return kamarInap?.detail[0]?.tgl_keluar + ' ' + kamarInap?.detail[0]?.jam_keluar;
}

export const parseCaraPulang = (label: string) => {
  switch (label.toLowerCase()) {
    case 'atas persetujuan dokter':
      return 'home'
    case 'dirujuk':
      return 'transfer'
    case 'atas permintaan sendiri':
      return 'refuse'
    case 'meninggal':
      return 'deceased'
    case 'lain-lain':
      return 'other'
    default:
      return ''
  }
}

export const moveItemInArray = (arr: any[], from: number, to: number) => {
  const item = arr.splice(from, 1)[0]
  arr.splice(to, 0, item)
}

// Ambil Data DPJP
export const fetchDpjp = async (runtimeConfig: any, tokenStore: any) => {
  return useAsyncData(`${runtimeConfig.public.API_V2_URL}/dokter/search`,
    useDebounceFn(() =>
      $fetch(`${runtimeConfig.public.API_V2_URL}/dokter/search`, {
        method: 'POST',
        query: { limit: 100 },
        headers: {
          'Authorization': `Bearer ${tokenStore?.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          filters: [
            { field: 'status', operator: '=', value: "1" }
          ],
        })
      }), 1000
    )
  );
};

// Kirim Online Klaim
export const kirimOnlineIndividual = async (runtimeConfig: any, tokenStore: any, sepNo: string) => {
  if (!sepNo) {
    throw new Error('Nomor SEP tidak ada');
  }

  const { data, error, refresh, status } = await useFetch(
    `${runtimeConfig.public.API_V2_URL}/eklaim/${sepNo}/send`,
    {
      headers: {
        'Authorization': `Bearer ${tokenStore?.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      method: 'GET',
    }
  );

  return { data, error, refresh, status };
};

// Cara Pulang Data
export const caraPulangData = [
  { "value": 1, "label": "Atas Persetujuan Dokter" },
  { "value": 2, "label": "Dirujuk" },
  { "value": 3, "label": "Atas Permintaan Sendiri" },
  { "value": 4, "label": "Meninggal" },
  { "value": 5, "label": "Lain-Lain" }
]

// Cata Masuk Data
export const caraMasukData = [
  { "value": "gp", "label": "Rujukan FKTP"},
  { "value": "hosp-trans", "label": "Rujukan FKRTL"},
  { "value": "mp", "label": "Rujukan Dokter Spesialis"},
  { "value": "outp", "label": "Dari Rawat Jalan"},
  { "value": "inp", "label": "Dari Rawat Inap"},
  { "value": "emd", "label": "Dari Rawat Darurat"},
  { "value": "born", "label": "Lahir di Rumah Sakit"},
  { "value": "nursing", "label": "Rujukan dari Panti Jompo"},
  { "value": "psych", "label": "Rujukan dari Rumah Sakit Jiwa"},
  { "value": "rehab", "label": "Rujukan dari Fasilitas Rehabilitasi"},
  { "value": "other", "label": "Lain-lain"}
]