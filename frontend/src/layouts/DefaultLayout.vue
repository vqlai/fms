<script setup lang="ts">
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <div class="flex h-screen bg-bg">
    <AppSidebar />
    <div class="flex flex-1 flex-col overflow-hidden">
      <AppHeader />
      <main class="flex-1 overflow-auto p-6">
        <router-view />
      </main>
    </div>
    <Transition name="toast">
      <div
        v-if="uiStore.toast"
        class="fixed top-4 left-1/2 z-50 -translate-x-1/2 transform"
      >
        <div
          class="rounded-lg px-6 py-3 text-white shadow-lg"
          :class="{
            'bg-success-500': uiStore.toast.type === 'success',
            'bg-danger-500': uiStore.toast.type === 'error',
            'bg-warning-500': uiStore.toast.type === 'warning',
            'bg-primary-600': uiStore.toast.type === 'info',
          }"
        >
          {{ uiStore.toast.message }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -1rem);
}
</style>
