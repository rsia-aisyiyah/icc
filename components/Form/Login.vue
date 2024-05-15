<script setup>
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
      router.push('/')
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
  <Vueform  
    ref="form$"
    size="md"
    :display-errors="false"
    method="POST"
    endpoint="http://172.24.19.22/rsia/api/v2/user/auth/login"
    @response="handleResponse"
  >
    <StaticElement
      name="register_title"
      content="Login"
      tag="h1"
    />
    <StaticElement
      name="page_subtitle"
      content="Login untuk dapat menggunakan layanan yang ada."
    />
    <StaticElement
      name="divider"
      tag="hr"
    />
    <TextElement
      name="username"
      label="Username ( NIK )"
      info="NIK Karywan, sesuai dengan kartu karyawan anda. "
      placeholder="username ( nik )"
      :floating="false"
      field-name="username"
      :rules="[
        'required',
      ]"
      id="username"
      autocomplete="off"
    />
    <TextElement
      name="password"
      input-type="password"
      label="Password"
      placeholder="password"
      :floating="false"
      field-name="password"
      :rules="[
        'required',
      ]"
      autocomplete="off"
      id="password"
    />
    <StaticElement
      name="divider_1"
      tag="hr"
    />
    <ButtonElement
      name="register"
      :submits="true"
      button-label="Create account"
      :full="true"
      size="lg"
    />
  </Vueform>
</template>