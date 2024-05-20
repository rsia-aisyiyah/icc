<template>
  <div class="p-2 px-4 bg-gray-900 rounded-lg mb-3 shadow w-fit sticky z-50 top-[0.32rem]">
    <UBreadcrumb 
      divider="i-heroicons-chevron-right-20-solid"
      :links="[
        { label: 'Home' , icon: 'i-heroicons-home' , to: '/' }, 
        { label: 'Pasien' , icon: 'i-uil-user' }, 
        { label: 'Rawat Inap' , icon: 'i-healthicons-inpatient' }
      ]" 
    />
  </div>

  <TablePasienRanap />
</template>