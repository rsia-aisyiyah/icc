// vueform.config.(js|ts)

import id from '@vueform/vueform/locales/id'
import tailwind from '@vueform/vueform/dist/tailwind'
import { defineConfig } from '@vueform/vueform'

export default defineConfig({
  theme: tailwind,
  locales: { id },
  locale: 'id',
})