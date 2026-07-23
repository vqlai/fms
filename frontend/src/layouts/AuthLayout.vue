<script setup lang="ts">
import { useUiStore } from '@/stores/ui'

const uiStore = useUiStore()
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-bg px-4">
    <div class="w-full max-w-md">
      <div class="mb-8 text-center">
        <h1 class="text-3xl font-bold text-primary-600">家庭管家</h1>
        <p class="mt-2 text-muted">让家庭管理更简单</p>
      </div>
      <div class="rounded-xl bg-card p-8 shadow-sm">
        <router-view />
      </div>
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
