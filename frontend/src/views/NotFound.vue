<script setup lang="ts">
import EmptyState from '@/components/common/EmptyState.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-bg">
    <EmptyState icon="🔍" title="页面不存在" description="您访问的页面不存在或已被移除">
      <template #action>
        <button
          class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          @click="goHome"
        >
          返回首页
        </button>
      </template>
    </EmptyState>
  </div>
</template>
