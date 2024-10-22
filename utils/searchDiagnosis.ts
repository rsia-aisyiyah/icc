import { useDebounceFn } from '@vueuse/core'

export const [dul, iil] = [ref(false), ref(false)]
export const [pul, pil] = [ref(false), ref(false)]

export async function fetchDiagnosaUnu(query: string) {
  const config = useRuntimeConfig();
  dul.value = true;

  if (query.length < 3) {
    dul.value = false;
    return [];
  }

  const { data, status } = await useDebounceFn(async () => await useFetch(`${config.public.API_V2_URL}/eklaim/diagnosis/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search: { value: query } }),
  }), 1200)();

  if (status.value == 'success') {
    const d = data.value as any;
    if (d.response.count > 0) {
      const mapped = d.response.data.map((item: any) => {
        return { value: item[1], title: item[0], label: `${item[1]} - ${item[0]}` };
      });

      dul.value = false;
      return mapped;
    }

    dul.value = false;
    return [];
  }

  dul.value = false;
  return [];
}

export async function fetchProsedurUnu(query: string) {
  const config = useRuntimeConfig();
  pul.value = true;

  if (query.length < 3) {
    pul.value = false;
    return [];
  }

  const { data, status } = await useDebounceFn(async () => await useFetch(`${config.public.API_V2_URL}/eklaim/procedures/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ search: { value: query } }),
  }), 1200)();

  if (status.value == 'success') {
    const d = data.value as any;
    if (d.response.count > 0) {
      const mapped = d.response.data.map((item: any) => {
        return { value: item[1], title: item[0], label: `${item[1]} - ${item[0]}` };
      });

      pul.value = false;
      return mapped;
    }

    pul.value = false;
    return [];
  }

  pul.value = false;
  return [];
}