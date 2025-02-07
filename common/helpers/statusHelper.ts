const setStatus = [
  { id: "", label: "Semua Data", icon: "i-tabler-align-box-left-stretch", color: "primary", variant: "soft" },

  { id: "belum", label: "Belum Proses", icon: "i-tabler-hash", color: "fuchsia", variant: "soft" },

  { id: "verifikasi resume", label: "verifikasi resume", icon: "i-tabler-checklist", color: "blue", variant: "soft" },
  { id: "lengkap", label: "lengkap", icon: "i-tabler-checkbox", color: "lime", variant: "soft" },
  { id: "pengajuan", label: "pengajuan", icon: "i-tabler-cube-send", color: "amber", variant: "outline" },
  { id: "perbaiki", label: "perbaiki", icon: "i-tabler-hammer", color: "orange", variant: "soft" },
  { id: "disetujui", label: "disetujui", icon: "i-tabler-rosette-discount-check", color: "primary", variant: "soft" },
  { id: "klaim ambulans", label: "klaim ambulans", icon: "i-tabler-ambulance", color: "fuchsia", variant: "soft" },
  { id: "batal", label: "batal", icon: "i-tabler-circle-x", color: "rose", variant: "soft" },
  { id: "pending", label: "pending", icon: "i-tabler-refresh", color: "gray", variant: "solid" },
];

const determineStatus = (status: string | undefined) => {
  if (status === undefined) return undefined;
  return setStatus.find((item) => item.id.includes(status));
}

export { determineStatus, setStatus }