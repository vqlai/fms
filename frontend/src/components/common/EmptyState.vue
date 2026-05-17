<script setup lang="ts">
defineProps<{
  icon?: string
  title?: string
  description?: string
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-16 text-center">
    <div v-if="icon" class="mb-4 text-5xl">{{ icon }}</div>
    <h3 class="text-lg font-medium text-gray-900">{{ title ?? '暂无数据' }}</h3>
    <p v-if="description" class="mt-1 text-sm text-muted">{{ description }}</p>
    <div class="mt-4">
      <slot name="action" />
    </div>
  </div>
</template>
