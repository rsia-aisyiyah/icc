<script setup>
const config = useRuntimeConfig()
const form$ = ref(null)

onMounted(() => {
  const config = useRuntimeConfig()
  form$.value.update({
    username: config.public.TEST_USERNAME,
    password: config.public.TEST_PASSWORD
  })
});

const handleResponse = (response, form$) => {
  const toast = useToast()
  const router = useRouter()
  const tokenStore = useAccessTokenStore()

  if (response.status == 200) {
    tokenStore.set(response.data.access_token)
    router.push('/ranap')
  } else {
    toast.add({
      title: 'Login failed',
      description: response.data.message,
      status: 'error',
      color: 'red'
    })
  }
}
</script>

<template>
  <Vueform ref="form$" size="md" :display-errors="false" method="POST" :endpoint="`${config.public.API_V2_URL}/user/auth/login`" @response="handleResponse">
    <StaticElement name="register_title" content="Login" tag="h2" />
    <StaticElement name="page_subtitle" content="Login untuk dapat menggunakan layanan yang ada." tag="p" element="p" size="sm"/>
    <StaticElement name="divider" tag="hr" />
    
    <TextElement 
      name="username" 
      label="Username ( NIK )" 
      info="NIK Karywan, sesuai dengan kartu karyawan anda. "
      placeholder="username ( nik )" 
      field-name="username" 
      autocomplete="off" 
      :floating="false" 
      :rules="[ 'required' ]" 
      id="username" 
      size="md"
    />
      
    <TextElement 
      name="password" 
      label="Password" 
      input-type="password" 
      placeholder="password" 
      field-name="password" 
      :floating="false"
      :rules="[ 'required' ]" 
      autocomplete="off" 
      id="password" 
      size="md"
    />
    
    <StaticElement name="divider_1" tag="hr" />
    
    <ButtonElement name="register" :submits="true" button-label="Login" :full="true" size="lg" />
  </Vueform>
</template>