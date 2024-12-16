
import type { NotificationColor } from '#ui/types'

export const addToaster = (title: string, description: string, color: NotificationColor, icon: string) => {
  const toast = useToast()

  toast.add({
    title: title,
    description: description,
    color: color,
    icon: icon
  })
}