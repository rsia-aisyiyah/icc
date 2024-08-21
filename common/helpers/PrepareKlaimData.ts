export const PrepareKlaimData = (data: object) => {
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

  // Return the result
  return r;
};
