import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  type: ToastType
  message: string
}

export const useUiStore = defineStore('ui', () => {
  const sidebarCollapsed = ref(false)
  const globalLoading = ref(false)
  const toast = ref<Toast | null>(null)
  let toastTimer: ReturnType<typeof setTimeout> | null = null

  function toggleSidebar() {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  function showToast(type: ToastType, message: string, duration = 3000) {
    if (toastTimer) clearTimeout(toastTimer)
    toast.value = { type, message }
    toastTimer = setTimeout(() => {
      toast.value = null
    }, duration)
  }

  function setGlobalLoading(loading: boolean) {
    globalLoading.value = loading
  }

  return { sidebarCollapsed, globalLoading, toast, toggleSidebar, showToast, setGlobalLoading }
})
