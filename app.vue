<template>
  <NuxtLoadingIndicator />

  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>

  <UNotifications />

  <!-- absolut on bottom right -->
  <div class="fixed bottom-0 left-0 p-4">
    <UButton color="sky" @click="isOpen = true"
      class="w-10 h-10 border-2 border-white shadow-xl rounded-full flex items-center justify-center hover:scale-125 transition-transform">
      <UIcon class="text-white h-16 w-16" name="i-tabler-sparkles"/>
    </UButton>
  </div>

  <!-- modal -->
  <UModal v-model="isOpen">
    <UCard>
      <div class="space-y-5">
        <div>
          <h1 class="font-semibold">do your magick ✨</h1>
          <p class="text-gray-500 text-sm">input someting and see the magic happen</p>
        </div>

        <UFormGroup label="Nomor SEP" name="sep">
          <UInput v-model="keywords" placeholder="nomor sep pasien" icon="i-tabler-sparkles" autofocus autocomplete="off"/>
        </UFormGroup>

        <template v-if="status == 'pending'">
          <div class="flex justify-center py-5">
            <UIcon name="i-tabler-loader" class="text-gray-500 animate-spin h-8 w-8" />
          </div>
        </template>

        <template v-else-if="status == 'error'">
          <div class="flex justify-center py-5">
            <UIcon name="i-tabler-alert-triangle" class="text-red-500 h-8 w-8" />
          </div>
        </template>

        <template v-else-if="status == 'success'">
          <div class="space-y-8">
            <div class="flex flex-col gap-3">
              <ULink v-for="item in (data as any)?.data" :key="item.no_sep" class="text-left" :to="`/klaim/${item.no_sep}`" @click="keywords = ''; isOpen = false">
                <div class="p-4 rounded-xl border bg-gray-50 group hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden">
                  <div class="flex items-top justify-start gap-3">
                    <UIcon class="h-6 w-6" :name="item.jnspelayanan == 1 ? 'i-tabler-bed' : 'i-tabler-walk'"/>
                    <div class="w-full">
                      <div class="flex justify-between items-center">
                        <h1 class="font-semibold capitalize leading-[22px] mb-1 ">{{ item.nama_pasien.toLowerCase() }}
                        </h1>
                        <UBadge size="sm" color="gray">{{ item.nomr }}</UBadge>
                      </div>
                      <div class="flex flex-col gap-1">
                        <div class="flex gap-1">
                          <UBadge size="sm" color="gray" variant="subtle">{{ parseDate(item.tanggal_lahir) }}</UBadge>
                          <UBadge size="sm" color="gray" variant="subtle">{{ dateToAge(item.tanggal_lahir) }} Th</UBadge>
                        </div>
                        <div class="flex gap-1">
                          <UBadge size="sm" color="indigo" variant="subtle">{{ item.no_kartu }}</UBadge>
                          <UBadge size="sm" color="primary" variant="subtle">{{ item.no_sep }}</UBadge>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </ULink>
            </div>

            <div class="flex gap-5 items-center justify-center">
              <UPagination v-model="currentPage" :page-count="((data as any)?.meta as any)?.per_page" :total="((data as any)?.meta as any)?.total" />
            </div>
          </div>
        </template>
      </div>
    </UCard>
  </UModal>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router'
import { logEvent } from '~/utils/firebase'
import { useDebounceFn } from '@vueuse/core'

const token = useAccessTokenStore()
const config = useRuntimeConfig()
const currentPage = ref(1)
const router = useRouter()
const isOpen = ref(false)
const keywords = ref('')

// Log page views
router.afterEach((to, from) => {
  logEvent('page_view', {
    page_path: to.fullPath,
    page_title: document.title,
  })
})

// Trigger the API request only when `keywords` is not empty
const { data, error, refresh, status } = await useAsyncData(
  'sep/search',
  useDebounceFn(() => {
    if (keywords.value.trim() !== '') {
      return $fetch(`${config.public.API_V2_URL}/sep/search`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.accessToken}`,
          Accept: 'application/json',
          ContentType: 'application/json'
        },
        body: JSON.stringify({
          search: { value: keywords.value }
        }),
        query: { page: currentPage.value, limit: 4 }
      })
    }
    return null
  }, 1300),
  { immediate: true, watch: [keywords, currentPage] }
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

// TODO : GET CPPT

</script>
