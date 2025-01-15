import { useRuntimeConfig } from '#app';
import { useAccessTokenStore } from '#build/imports';

interface SITBValidationState {
  jkn_sitb_noreg: string;
  nomor_sep: string;
}

// Exported reactive references for data
export const sitbState = reactive({
  validasiStatus: null as string | null,
  valid: false,
});

// Exported validation function
export const validasiSITB = async (state: SITBValidationState): Promise<void> => {
  const toast = useToast();
  const tokenStore = useAccessTokenStore();
  const runtimeConfig = useRuntimeConfig();

  try {
    if (!state.jkn_sitb_noreg) {
      throw new Error('Nomor register SITB tidak boleh kosong');
    }

    const { data: sitbValidasiData, error: sitbValidasiError, status } = await useFetch(
      `${runtimeConfig.public.API_V2_URL}/eklaim/sitb/validate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokenStore?.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: {
          nomor_sep: state.nomor_sep,
          nomor_register_sitb: state.jkn_sitb_noreg
        }
      }
    );

    if (sitbValidasiError.value) {
      throw new Error(sitbValidasiError?.value?.data?.message || 'Validasi SITB gagal.');
    }

    sitbState.validasiStatus = status.value as string;

    if (sitbState.validasiStatus === 'success') {
      toast.add({
        title: 'Success',
        description: 'Data SITB berhasil divalidasi',
        color: 'green',
        icon: 'i-tabler-discount-check-filled'
      });

      sitbState.valid = true;
    } else {
      toast.add({
        title: 'Error',
        description: 'Data SITB tidak valid',
        color: 'red',
        icon: 'i-tabler-info-circle-filled'
      });

      sitbState.valid = false;
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red',
      icon: 'i-tabler-info-circle-filled'
    });

    sitbState.validasiStatus = 'error';
  }
};


export const inValidasiSITB = async (sep: string): Promise<void> => {
  const toast = useToast();
  const tokenStore = useAccessTokenStore();
  const runtimeConfig = useRuntimeConfig();

  try {
    if (!sep) {
      throw new Error('Nomor SEP tidak boleh kosong');
    }

    const { data: sitbValidasiData, error: sitbValidasiError, status } = await useFetch(
      `${runtimeConfig.public.API_V2_URL}/eklaim/sitb/invalidate/${sep}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenStore?.accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      }
    );

    if (sitbValidasiError.value) {
      throw new Error(sitbValidasiError?.value?.data?.message || 'Invalidasi SITB gagal.');
    }

    sitbState.validasiStatus = status.value as string;

    if (sitbState.validasiStatus === 'success') {
      toast.add({
        title: 'Success',
        description: 'Data SITB berhasil diinvalidasi',
        color: 'green',
        icon: 'i-tabler-discount-check-filled'
      });

      sitbState.valid = false;
    } else {
      toast.add({
        title: 'Error',
        description: 'Data SITB tidak valid',
        color: 'red',
        icon: 'i-tabler-info-circle-filled'
      });

      sitbState.valid = false
    }
  } catch (error: any) {
    toast.add({
      title: 'Error',
      description: error.message,
      color: 'red',
      icon: 'i-tabler-info-circle-filled'
    });

    sitbState.validasiStatus = 'error';
  }
}