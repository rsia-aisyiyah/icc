import { differenceInMinutes, parse } from "date-fns";

export const getDiff = (masuk: string | null, keluar: string | null) => {
  // Set timezone offset for 'Asia/Jakarta' (UTC+7)
  const timeZoneOffset = 7 * 60; // 7 hours in minutes

  if (!masuk || !keluar) {
    return { days: 0, hours: 0, minutes: 0 }; // Handle case where masuk or keluar is null or undefined
  }

  // Convert masuk and keluar to Date with locale id-ID
  const dateMasuk = parse(masuk.replaceAll('.', ':'), 'yyyy-MM-dd HH:mm:ss', new Date());
  const dateKeluar = parse(keluar.replaceAll('.', ':'), 'yyyy-MM-dd HH:mm:ss', new Date()); 

  // count days from dateMasuk to dateKeluar
  const countDays = (dateMasuk: Date, dateKeluar: Date) => {
    dateMasuk.setHours(0,0,0,0);
    dateKeluar.setHours(0,0,0,0);

    const diffTime = dateKeluar.getTime() - dateMasuk.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  
  // Adjust the dates to the 'Asia/Jakarta' timezone
  const adjustedDateMasuk = new Date(dateMasuk.getTime() + timeZoneOffset * 60 * 1000);
  const adjustedDateKeluar = new Date(dateKeluar.getTime() + timeZoneOffset * 60 * 1000);

  // Calculate total difference in minutes
  const totalMinutes = differenceInMinutes(adjustedDateKeluar, adjustedDateMasuk);

  const diffDays = countDays(dateMasuk, dateKeluar) + 1;
  const diffHours = Math.floor(totalMinutes / 60);
  const diffMinutes = (totalMinutes % 60);

  return { days: diffDays, hours: diffHours, minutes: diffMinutes };
}