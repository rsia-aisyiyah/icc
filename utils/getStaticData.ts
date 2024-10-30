export interface CarabayarData {
  value: string;
  label: string;
  description: string;
}

export interface CobData {
  value: string;
  label: string;
  enabled: boolean;
}

export interface CaraMasukData {
  value: string;
  label: string;
}

export interface CaraPulangData {
  value: string;
  label: string;
}

export interface DpjpData {
  value: string;
  label: string;
}

export interface JenisTarifData {
  value: string;
  label: string;
}

/**
 * Generic function to fetch and process data
 * @param url The URL to fetch the data from
 * @param mapFn Function to map the data to the desired format
 * @returns {Promise<{ value: string; label: string }[]>} The processed data
 * @throws {Error} The error when failed to fetch the data
 */
const fetchData = async <T>(
  url: string,
  mapFn: (item: T) => { value: string; label: string }
): Promise<{ value: string; label: string }[]> => {
  try {
    const data = await $fetch<T[]>(url);

    if (!data) {
      return [];
    }

    return data.map(mapFn);
  } catch (error) {
    console.error(`Failed to fetch data from ${url}:`, error);
    throw new Error(`Failed to fetch data from ${url}`);
  }
};



export const getCaraBayarData = () => fetchData<CarabayarData>('/cara_bayar.json', (item) => ({
  value: item.value,
  label: item.label,
  description: item.description,
}));

export const getEnabledCobData = () => fetchData<CobData>('/cob.json', (item) => ({
  value: item.value,
  label: item.label,
  enabled: item.enabled,
})).then(data => data.filter(item => (item as CobData).enabled));

export const getCaraMasukData = () => fetchData<CaraMasukData>('/cara_masuk.json', (item) => ({
  value: item.value,
  label: item.label,
}));

export const getCaraPulangData = () => fetchData<CaraPulangData>('/cara_pulang.json', (item) => ({
  value: item.value,
  label: item.label,
}));

export const getDpjpData = () => fetchData<DpjpData>('/dpjp.json', (item) => ({
  value: item.value,
  label: item.label,
}));

export const getJenisTarifData = () => fetchData<JenisTarifData>('/jenis_tarif.json', (item) => ({
  value: item.value,
  label: item.label,
}));
