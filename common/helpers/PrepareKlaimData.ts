import { tarifFields } from "~/data/tarifFields";

export const prepareKlaimData = (data: object) => {
  // Remove undefined, empty string, and convert boolean to number
  const r = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, typeof v === 'boolean' ? (v ? 1 : 0) : v])
  );

  // Helper function for date formatting
  const formatDateTime = (date: Date) =>
    date.toISOString().split('T')[0] + ' ' + date.toLocaleTimeString().replaceAll('.', ':');

  // Format specific date fields
  ['tgl_masuk', 'tgl_pulang', 'start_dttm', 'stop_dttm'].forEach((key) => {
    if (r[key]) r[key] = formatDateTime(r[key]);
  });

  // Loop through tarifFields to process numeric values
  tarifFields.forEach(({ name }) => {
    const value = r[name];

    // Ensure value is processed if not undefined or empty, otherwise set to 0
    r[name] = value !== undefined && value !== '' ? Number(value.replace(/\.|,/g, '')) : 0;
  });

  // Return the result
  return r;
};
