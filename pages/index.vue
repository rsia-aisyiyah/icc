<script lang="ts" setup>
import { determineStatus } from '~/common/helpers/statusHelper';

const $router = useRouter();
const config = useRuntimeConfig();
const token = useAccessTokenStore();
const month = ref(new Date().toISOString().slice(0, 7));

const { data: bupel, error: bupelError, refresh: bupelRefresh, status: bupelStatus } = await useAsyncData(
  '/klaim/bupel',
  () => $fetch(`${config.public.API_V2_URL}/klaim/bupel`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token.accessToken}`,
      accept: 'application/json',
      ContentType: 'application/json',
    }
  }),
  { immediate: true, watch: [month] }
);

if (bupelStatus.value === 'success') {
  if ((bupel.value as any).data?.bulan) {
    month.value = (bupel.value as any).data?.bulan;
  }
}

const { data: dashboard, error, refresh, status } = await useAsyncData<{ message: string; data: { status: string; total: number }[] }>(
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
  }),
  { immediate: true, watch: [month] }
);

// watch month value if updated then make a request to update the bupel data
watch(month, async (newVal) => {
  const { data, error, status } = await useAsyncData(
    '/klaim/bupel',
    () => $fetch(`${config.public.API_V2_URL}/klaim/bupel`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token.accessToken}`,
        accept: 'application/json',
        ContentType: 'application/json',
      },
      body: JSON.stringify({
        bulan: newVal,
      })
    }),
    { immediate: true }
  );
});

const colorVariant: Record<string, string> = {
  "blue": "dark:bg-blue-500/25 bg-blue-400/25",
  "lime": "dark:bg-lime-500/25 bg-lime-400/25",
  "amber": "dark:bg-amber-500/25 bg-amber-400/25",
  "orange": "dark:bg-orange-500/25 bg-orange-400/25",
  "primary": "dark:bg-primary-500/25 bg-primary-400/25",
  "fuchsia": "dark:bg-fuchsia-500/25 bg-fuchsia-400/25",
  "rose": "dark:bg-rose-500/25 bg-rose-400/25",
  "gray": "dark:bg-gray-500/25 bg-gray-400/25"
}

const toData = (key: string, subKey: string) => {
  if (key == 'Rawat Inap') {
    $router.push(`/ranap?status=${subKey}&month=${month.value}`);
  } else {
    $router.push(`/ralan?status=${subKey}&month=${month.value}`);
  }
}

const toBerkasTerkirimData = (key: string) => {
  if (key == 'Rawat Inap') {
    $router.push({
      path: '/ranap',
      query: {
        terkirim: 1,
        month: month.value
      }
    });
  } else {
    $router.push({
      path: '/ralan',
      query: {
        terkirim: 1,
        month: month.value
      }
    });
  }
}

const downloadBatch = (jnspelayanan: number) => {
  window.open(`${config.public.API_V2_URL}/sep/download/${month.value}/${jnspelayanan}?token=${token.accessToken}`, '_blank', 'noopener,noreferrer');
}

const checkUp = (num: number, denum: number) => {
  if (num > denum) {
    return 'up';
  } else if (num < denum) {
    return 'down';
  } else {
    return 'same';
  }
}

const getPercentage = (num: number, denum: number): string => {
  if (denum === 0) {
    return "N/A"; // Menghindari pembagian dengan nol
  }

  const percentageChange = Math.abs(((num - denum) / denum) * 100);
  return `${percentageChange.toFixed(1)}`;
};
</script>

<template>
  <UCard class="mb-4">
    <div class="flex flex-row items-center justify-between">
      <!-- title -->
      <div>
        <h1 class="text-2xl font-bold">Dashboard Klaim</h1>
        <p class="text-base dark:text-gray-400">Dashboard klaim bulan ini</p>
      </div>

      <UFormGroup label="Filter Bulan">
        <UInput type="month" size="sm" icon="i-tabler-calendar" class="max-w-md" v-model="month" />
      </UFormGroup>
    </div>
  </UCard>

  <!-- loop dashboard.data and show the status and total as number as card -->
  <template v-if="dashboard">
    <div class="flex flex-col lg:flex-row gap-4">
      <template v-for="(item, key) in dashboard.data">
        <UCard class="mb-4 w-full rounded-xl overflow-hidden"
          :ui="{ header: { background: key.toString() == 'Rawat Inap' ? 'bg-indigo-200 dark:bg-indigo-900' : 'bg-pink-200 dark:bg-pink-900' } }">
          <template #header>
            <div class="flex flex-row items-center justify-between">
              <h1 class="text-xl font-semibold">{{ key }}</h1>
              <div class="flex gap-3">
                <UButton variant="soft" icon="i-tabler-refresh" @click="refresh" :color="key.toString() == 'Rawat Inap' ? 'indigo' : 'pink'" />
                <UButton variant="solid" icon="i-tabler-cloud-download"
                  @click="downloadBatch(key.toString() == 'Rawat Inap' ? 1 : 2)" :color="key.toString() == 'Rawat Inap' ? 'indigo' : 'pink'" />
              </div>
            </div>
          </template>

          <div class="grid grid-cols-2 gap-4">
            <UCard
              class="rounded-xl bg-primary-100/25 dark:bg-primary-500/25 group hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden">
              <template v-if="status == 'pending'">
                <!-- skeleton -->
                <div class="flex flex-row items-center justify-between w-full animate-pulse">
                  <div>
                    <div class="h-11 dark:bg-gray-700 bg-gray-200 rounded w-[100px]"></div>
                    <div class="h-4  mt-1 dark:bg-gray-700 bg-gray-200 rounded w-[180px]"></div>
                  </div>
                  <div class="flex items-end justify-end h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700">
                  </div>
                </div>
              </template>

              <template v-if="status == 'success'">
                <div class="w-full">
                  <div class="flex flex-row-reverse items-center justify-between w-full text-right">
                    <div>
                      <div
                        class="text-4xl font-semibold text-primary group-hover:text-white duration-300 transition-colors ease-in-out">
                        {{ (item as any).total_sep ?? 0 }}
                      </div>
                    </div>

                    <div
                      class="leading-none rounded-full h-14 w-14 flex items-center justify-center bg-primary-400 group-hover:bg-primary-600 duration-500 transition-colors ease-in-out relative">
                      <UIcon name="i-tabler-medical-cross" class="text-white h-7 w-7 leading-none m-0 p-0" />
                      <div
                        class="absolute h-10 w-10 bg-primary-400 dark:bg-primary-700 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full -z-10 group-hover:scale-[30] transition-all duration-500 ease-in-out">
                      </div>
                    </div>
                  </div>

                  <!-- sep last month -->
                  <div class="flex flex-row items-center justify-between w-full mt-4">
                    <div class="text-base text-primary group-hover:text-white duration-300 transition-colors ease-in-out font-semibold">
                      Total Sep Klaim
                    </div>

                    <div class="flex gap-1 items-center justify-start">
                      <div class="flex items-center justify-center">
                        <template v-if="checkUp((item as any).total_sep, (item as any).total_sep_last_month) == 'up'">
                          <UIcon name="i-tabler-arrow-up" class="text-green-500 h-5 w-5 group-hover:text-white duration-300 transition-colors ease-in-out" />
                        </template>

                        <template v-if="checkUp((item as any).total_sep, (item as any).total_sep_last_month) == 'down'">
                          <UIcon name="i-tabler-arrow-down" class="text-red-500 h-5 w-5" />
                        </template>

                        <template v-if="checkUp((item as any).total_sep, (item as any).total_sep_last_month) == 'same'">
                          <UIcon name="i-tabler-arrow-right" class="text-gray-500 h-5 w-5" />
                        </template>
                      </div>

                      <!-- percentage -->
                      <div class="text-base duration-300 transition-colors ease-in-out tracking-wide font-semibold" :class="`text-${checkUp((item as any).total_sep, (item as any).total_sep_last_month) == 'up' ? 'green' : checkUp((item as any).total_sep, (item as any).total_sep_last_month) == 'down' ? 'red' : 'gray'}-500 ${checkUp((item as any).total_sep, (item as any).total_sep_last_month) == 'up' ? 'group-hover:text-white' : ''}`">
                        {{ getPercentage((item as any).total_sep, (item as any).total_sep_last_month) }}%
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </UCard>

            <button @click="toBerkasTerkirimData(key.toString())">
              <UCard class="rounded-xl bg-indigo-100/25 dark:bg-indigo-500/25 group hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 overflow-hidden h-full">
                <template v-if="status == 'pending'">
                  <!-- skeleton -->
                  <div class="h-full flex flex-row items-center justify-between w-full animate-pulse">
                    <div>
                      <div class="h-11 dark:bg-gray-700 bg-gray-200 rounded w-[100px]"></div>
                      <div class="h-4  mt-1 dark:bg-gray-700 bg-gray-200 rounded w-[180px]"></div>
                    </div>
                    <div class="flex items-end justify-end h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700">
                    </div>
                  </div>
                </template>

                <template v-if="status == 'success'">
                  <div class="w-full">
                    <div class="h-full flex flex-row-reverse items-center justify-between w-full text-right">
                      <div>
                        <div class="text-4xl font-semibold text-indigo-400 group-hover:text-white duration-300 transition-colors ease-in-out">
                          {{ (item as any).total_berkas_terkirim ?? 0 }}
                        </div>
                      </div>
  
                      <div class="leading-none rounded-full h-14 w-14 flex items-center justify-center bg-indigo-400 group-hover:bg-indigo-600 duration-500 transition-colors ease-in-out relative">
                        <UIcon name="i-tabler-send" class="text-white h-7 w-7 leading-none m-0 p-0" />
                        <div class="absolute h-10 w-10 bg-indigo-400 dark:bg-indigo-700 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full -z-10 group-hover:scale-[30] transition-all duration-500 ease-in-out">
                        </div>
                      </div>
                    </div>

                    <div class="flex flex-row items-center justify-between w-full mt-4">
                      <div class="text-base text-indigo-400 group-hover:text-white duration-300 transition-colors ease-in-out font-semibold">
                        Total Berkas Terkirim
                      </div>

                      <div class="flex gap-1 items-center justify-start">
                        <!-- percentage with icon -->
                      </div>
                    </div>
                  </div>
                </template>
              </UCard>
            </button>
          </div>

          <hr class="my-7 dark:border-gray-700 border-gray-200" />

          <div class="grid grid-cols-2 gap-4">
            <template v-for="(subItem, subKey) in item?.status" :key="key">
              <button
                class="text-left rounded-xl hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                @click="toData(key.toString(), subKey.toString())">
                <UCard class="rounded-xl">
                  <div class="flex flex-col gap-3 leading-0 items-start m-0 p-0">
                    <template v-if="status == 'pending'">
                      <!-- skeleton -->
                      <div class="flex flex-row items-center justify-between w-full animate-pulse">
                        <div>
                          <div class="h-11 dark:bg-gray-700 bg-gray-200 rounded w-[100px]"></div>
                          <div class="h-4  mt-1 dark:bg-gray-700 bg-gray-200 rounded w-[180px]"></div>
                        </div>
                        <div class="flex items-end justify-end h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700">
                        </div>
                      </div>
                    </template>

                    <template v-if="status == 'success'">
                      <div class="flex flex-row items-center justify-between w-full">
                        <div>
                          <div class="text-4xl font-semibold">
                            {{ subItem ?? 0 }}
                          </div>
                          <div class="text-base capitalize dark:text-gray-400">{{ subKey }}</div>
                        </div>

                        <!-- <div :class="`leading-none rounded-full h-14 w-14 flex items-center justify-center ${colorVariant[determineStatus(subKey.toString())?.color ?? 'primary']}`">
                          <UIcon :name="determineStatus(subKey.toString())?.icon ?? `i-tabler-alert-circle`" :class="`text-${determineStatus(subKey.toString())?.color}-500 h-7 w-7 leading-none m-0 p-0`" />
                        </div> -->
                      </div>
                    </template>
                  </div>
                </UCard>
              </button>
            </template>
          </div>
        </UCard>
      </template>
    </div>
  </template>
</template>