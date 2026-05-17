import { useUiStore } from '@/stores/ui'

export function useNotification() {
  const uiStore = useUiStore()

  return {
    showToast: uiStore.showToast,
    toast: uiStore.toast,
  }
}
