<script lang="ts" setup>
import { determineStatus } from '~/common/helpers/statusHelper';

const config = useRuntimeConfig();
const $router = useRouter();
const token = useAccessTokenStore();
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
  console.log(key, subKey);
  if (key == 'Rawat Inap') {
    $router.push(`/ranap?status=${subKey}&month=${month.value}`);
  } else {
    $router.push(`/ralan?status=${subKey}&month=${month.value}`);
  }
}
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
        <UCard class="mb-4 w-full rounded-xl overflow-hidden" :ui="{ header: {background: key.toString() == 'Rawat Inap' ? 'bg-indigo-200' : 'bg-pink-200'} }">
          <template #header>
            <div class="flex flex-row items-center justify-between">
              <h1 class="text-xl font-semibold">{{ key }}</h1>
              <UButton variant="soft" icon="i-tabler-refresh" @click="refresh" :color="key.toString() == 'Rawat Inap' ? 'indigo' : 'pink'" />
            </div>
          </template>

          <div class="grid grid-cols-2 gap-4">
            <template v-for="(subItem, subKey) in item" :key="key">
              <button class="text-left rounded-xl hover:shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
                @click="toData(key.toString(), subKey)">
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
                            {{ subItem.toLocaleString('en-US', { minimumIntegerDigits: 3 }) }}
                          </div>
                          <div class="text-base capitalize dark:text-gray-400">{{ subKey }}</div>
                        </div>

                        <div
                          :class="`leading-none rounded-full h-14 w-14 flex items-center justify-center ${colorVariant[determineStatus(subKey)?.color ?? 'primary']}`">
                          <UIcon :name="determineStatus(subKey)?.icon ?? `i-tabler-alert-circle`"
                            :class="`text-${determineStatus(subKey)?.color}-500 h-7 w-7 leading-none m-0 p-0`" />
                        </div>
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