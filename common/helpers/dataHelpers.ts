import type { KamarInap } from "~/types/kamarInap";

export interface DPJPData {
  value: string;
  label: string;
}

export const getDpjp = async (search: string | undefined): Promise<DPJPData | undefined> => {
  if (!search) {
    return undefined;
  }

  try {
    const response = await fetch('/dpjp.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const dpjpData: DPJPData[] = await response.json();
    return dpjpData.find((item: DPJPData) => item.label === search || item.value === search);
  } catch (error) {
    console.error('Failed to fetch DPJP data:', error);
    return undefined;
  }
};

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
  if (kamarInap.detail[0].tgl_keluar == "0000-00-00") {
    return new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString();
  }

  return kamarInap.detail[0].tgl_keluar + ' ' + kamarInap.detail[0].jam_keluar;
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