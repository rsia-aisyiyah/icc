<template>
  <div class="p-2 px-4 bg-gray-900 rounded-lg mb-3 shadow w-fit">
    <UBreadcrumb 
      divider="i-tabler-chevron-right"
      :links="[
        { label: 'Home' , icon: 'i-tabler-home' , to: '/' }, 
        { label: 'Pasien' , icon: 'i-tabler-user' }, 
        { label: 'Rawat Jalan' , icon: 'i-healthicons-outpatient' }
      ]" 
    />
  </div>
  
  <TablePasienRalan />
</template>