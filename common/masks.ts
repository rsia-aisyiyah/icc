import type { MaskInputOptions } from "maska";

export const moneyMask = reactive<MaskInputOptions>({
  mask: 'money',
  number: {
    fraction: 0,
    locale: 'id-ID',
    unsigned: true
  },
})