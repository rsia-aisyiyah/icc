import { tarifFields } from "~/data/tarifFields";

export const prepareKlaimData = (data: object) => {
  // Remove undefined, empty string, and convert boolean to number
  const r = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined && v !== '').map(([k, v]) => [k, typeof v === 'boolean' ? (v ? 1 : 0) : v])
  );

  // Helper function for date formatting
  // const formatDateTime = (date: Date) =>
  //   date.toISOString().split('T')[0] + ' ' + date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  const formatDateTime = (date: Date) => {
    try {
      // Validasi apakah date adalah instance dari Date dan valid
      if (!(date instanceof Date) || isNaN(date.getTime())) {
          throw new Error('Invalid date object');
      }

      // Format tanggal dan waktu menggunakan toLocaleTimeString
      const fullDate = date
          .toLocaleTimeString('id-ID', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
          })
          .replace(/\./g, ':'); // Ganti semua titik dengan tanda titik dua

      // Pisahkan menjadi waktu dan tanggal
      const [datePart, timePart] = fullDate.split(' ');

      // Format ulang tanggal (dmy) menjadi YYYY-MM-DD
      const dmy = datePart.replace(',', '').split('/').reverse().join('-');

      return `${dmy} ${timePart}`; // Gabungkan tanggal dan waktu
  } catch (error: any) {
      console.error('Error formatting date:', error.message);
      return date; // Kembalikan nilai asli jika terjadi kesalahan
  }
  }

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
