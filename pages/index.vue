<script lang="ts" setup>
import { determineStatus } from '~/common/helpers/statusHelper';

const config = useRuntimeConfig();
const token = useAccessTokenStore();
const toast = useToast();

const month = ref(new Date().toISOString().substr(0, 7));

const { data: dashboard, error, refresh, status } = await useAsyncData<{
  message: string;
  data: { status: string; total: number }[];
}>(
  '/sep/klaim/status/search',
  () => $fetch(`${config.public.API_V2_URL}/sep/klaim/status/search`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      accept: 'application/json',
      ContentType: 'application/json',
    },
    body: JSON.stringify({
      month: month.value,
    })
  }), {
  immediate: true,
  watch: [month]
});

watch(() => dashboard.value, (value) => {
  console.log(value);
});

const showMsg = (title: string, description: string, color: string) => {
  toast.add({
    icon: 'i-tabler-circle-info',
    title,
    description,
    color: (color as any),
    timeout: 2000
  });
};
</script>

<template>
  <UCard>
    <div class="flex flex-row items-center justify-between mb-7">
      <!-- title -->
      <div>
        <h1 class="text-2xl font-bold">Dashboard Klaim</h1>
        <p class="text-base dark:text-gray-400">Dashboard klaim bulan ini</p>
      </div>

      <UFormGroup label="Filter Bulan">
        <UInput type="month" size="sm" icon="i-tabler-calendar" class="max-w-md" v-model="month" />
      </UFormGroup>
    </div>

    <!-- loop dashboard.data and show the status and total as number as card -->
    <div class="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
      <UCard v-for="item in dashboard?.data" :key="item.status" class="dark:bg-gray-800 bg-white shadow-md">
        <div class="flex flex-col gap-3 leading-0 items-start m-0 p-0">
          <div
            class="dark:bg-sky-300/20 bg-sky-600/20 leading-none rounded-full h-12 w-12 flex items-center justify-center">
            <UIcon :name="determineStatus(item.status)?.icon ?? 'i-tabler-alert-circle'"
              class="text-sky-500 h-6 w-6 leading-none m-0 p-0" />
          </div>

          <template v-if="status == 'pending'">
            <!-- skeleton -->
            <div class="flex flex-row items-end justify-between w-full animate-pulse">
              <div>
                <div class="h-11 dark:bg-gray-700 bg-gray-200 rounded w-[100px]"></div>
                <div class="h-4  mt-1 dark:bg-gray-700 bg-gray-200 rounded w-[180px]"></div>
              </div>
              <div class="flex items-end justify-end h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
            </div>
          </template>

          <template v-if="status == 'success'">
            <div class="flex flex-row items-end justify-between w-full">
              <div>
                <div class="text-4xl font-semibold">
                  {{ item.total !== null ? item.total.toLocaleString('en-US', { minimumIntegerDigits: 3 }) : '' }}
                </div>
                <div class="text-base capitalize dark:text-gray-400">{{ item.status }}</div>
              </div>

              <div class="flex items-end justify-end">
                <UButton size="sm" color="sky" variant="soft" class="dark:bg-sky-300/20 bg-sky-600/20"
                  icon="i-tabler-chevron-right"
                  @click="showMsg('Underconstruction', 'this feature is under construction, please wait for the next update', 'sky')" />
                <span class="sr-only">Lihat Detail</span>
              </div>
            </div>
          </template>
        </div>
      </UCard>
    </div>
  </UCard>
</template>