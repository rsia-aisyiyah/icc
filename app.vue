<template>
  <NuxtLoadingIndicator />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <UNotifications />

  <!-- absolut on bottom right -->
  <div v-if="!url.path.includes('/auth')" class="fixed bottom-0 left-0 p-4">
    <UButton color="sky" @click="magickModalOpen = true" class="w-10 h-10 border-2 border-white shadow-xl rounded-full flex items-center justify-center hover:scale-125 transition-transform">
      <UIcon class="text-white h-16 w-16" name="i-tabler-sparkles" />
    </UButton>
  </div>

  <!-- modal -->
  <template v-if="!url.path.includes('/auth')">
    <UModal v-model="magickModalOpen">
      <UCard>
        <div class="space-y-5">
          <div>
            <h1 class="font-semibold">do your magick ✨</h1>
            <p class="text-gray-500 text-sm">input someting and see the magic happen</p>
          </div>
  
          <UFormGroup label="Nomor SEP" name="sep">
            <UInput v-model="magickKeywords" placeholder="nomor sep pasien" icon="i-tabler-sparkles" autofocus autocomplete="off" />
          </UFormGroup>
  
          <template v-if="magickStatus == 'pending'">
            <div class="flex justify-center py-5">
              <UIcon name="i-tabler-loader" class="text-gray-500 animate-spin h-8 w-8" />
            </div>
          </template>
  
          <template v-else-if="magickStatus == 'error'">
            <div class="flex justify-center py-5">
              <UIcon name="i-tabler-alert-triangle" class="text-red-500 h-8 w-8" />
            </div>
          </template>

          <template v-else-if="magickStatus == 'success'">
            <div class="space-y-8">
              <div class="flex flex-col gap-3">
                <ULink v-for="item in (magick as any)?.data" :key="item.no_sep" class="text-left" :to="`/klaim/${item.no_sep}`" @click="magickKeywords = ''; magickModalOpen = false">
                  <div class="p-4 rounded-xl border bg-gray-50 group hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden">
                    <div class="flex items-top justify-start gap-3">
                      <UIcon class="h-6 w-6" :name="item.jnspelayanan == 1 ? 'i-tabler-bed' : 'i-tabler-walk'" />
                      <div class="w-full">
                        <div class="flex justify-between items-center">
                          <h1 class="font-semibold capitalize leading-[22px] mb-1 ">{{ item.nama_pasien.toLowerCase() }}
                          </h1>
                          <UBadge size="sm" color="gray">{{ item.nomr }}</UBadge>
                        </div>
                        <div class="flex flex-col gap-1.5">
                          <div class="flex gap-1">
                            <UBadge size="sm" color="gray" variant="subtle">{{ parseDate(item.tanggal_lahir) }}</UBadge>
                            <UBadge size="sm" color="gray" variant="subtle">{{ dateToAge(item.tanggal_lahir) }} Th</UBadge>
                          </div>
                          <div class="flex gap-1">
                            <UBadge size="sm" color="indigo" variant="subtle">{{ item.no_kartu }}</UBadge>
                            <UBadge size="sm" color="primary" variant="subtle">{{ item.no_sep }}</UBadge>
                            <UBadge size="sm" color="rose" variant="subtle">{{ item.no_rawat }}</UBadge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ULink>
              </div>
  
              <div class="flex gap-5 items-center justify-center" v-if="((magick as any)?.meta as any)?.total > 4">
                <UPagination v-model="magickCurrentPage" :page-count="((magick as any)?.meta as any)?.per_page" :total="((magick as any)?.meta as any)?.total" />
              </div>
            </div>
          </template>
        </div>
      </UCard>
    </UModal>
  </template>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { logEvent } from '~/utils/firebase'
import { useDebounceFn } from '@vueuse/core'

const magickToken = useAccessTokenStore()
const magickConfig = useRuntimeConfig()
const magickModalOpen = ref(false)
const magickRouter = useRouter()
const magickCurrentPage = ref(1)
const magickKeywords = ref('')

// get url
const url = useRoute()

// Log page views
magickRouter.afterEach((to, from) => {
  logEvent('page_view', {
    page_path: to.fullPath,
    page_title: document.title,
  })
})

// Trigger the API request only when `keywords` is not empty
const { data: magick, error: magickError, refresh: magickRefresh, status: magickStatus } = await useAsyncData(
  'magick-sep/search',
  useDebounceFn(() => {
    if (magickKeywords.value.trim() !== '') {
      return $fetch(`${magickConfig.public.API_V2_URL}/sep/search`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${magickToken.accessToken}`,
          Accept: 'application/json',
          ContentType: 'application/json'
        },
        body: JSON.stringify({
          search: { value: magickKeywords.value }
        }),
        query: { page: magickCurrentPage.value, limit: 4 }
      })
    }
    return null
  }, 1300),
  { immediate: true, watch: [magickKeywords, magickCurrentPage] }
);

const parseDate = (date: string) => {
  return new Date(date).toLocaleDateString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const dateToAge = (date: string) => {
  const today = new Date()
  const birthDate = new Date(date)
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age
}
</script>
