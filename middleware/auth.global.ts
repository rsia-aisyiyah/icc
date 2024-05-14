// Middleware untuk otentikasi route
// Middleware ini memastikan bahwa pengguna memiliki token akses yang valid sebelum mengakses rute tertentu
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Daftar rute yang dikecualikan dari pengecekan otentikasi
  const ignorePaths = ["/auth/login", "/auth/register"]

  // Mengambil token akses dari store (pinia)
  const accessTokenStore = useAccessTokenStore()
  const accessToken = accessTokenStore.accessToken
  const runtimeConfig = useRuntimeConfig()

  // Jika rute saat ini adalah salah satu dari rute yang dikecualikan
  // dan pengguna tidak memiliki token akses, maka lanjutkan
  if (ignorePaths.includes(to.path) && !accessToken) {
    return
  }
  
  // Jika pengguna tidak memiliki token akses, arahkan ke halaman login
  if (!accessToken) {
    return navigateTo("/auth/login")
  }
  
  
  // Set header untuk request API dengan token akses
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json"
  };

  try {
    // Lakukan panggilan API untuk memeriksa kevalidan token akses
    const { error } = await useFetch(`${runtimeConfig.public.API_V2_URL}/user/auth/detail`, {
      headers
    })

    // Jika panggilan API tidak berhasil atau token tidak valid,
    // hapus token akses dan arahkan kembali ke halaman login
    if (error.value) {
      accessTokenStore.clearToken()
      return navigateTo("/auth/login")
    }

    // Jika rute yang diminta adalah halaman yang dikecualikan,
    // arahkan kembali ke halaman utama
    if (ignorePaths.includes(to.path)) {
      return navigateTo("/")
    }

    // Jika tidak ada masalah, lanjutkan ke rute yang diminta
    accessTokenStore.setToken(accessToken)
    return
  } catch (error) {
    // Jika terjadi kesalahan saat melakukan panggilan API,
    // hapus token akses dan arahkan kembali ke halaman login
    accessTokenStore.clearToken()
    return navigateTo("/auth/login")
  }
})
