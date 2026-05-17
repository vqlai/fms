<script setup lang="ts">
defineProps<{
  rows?: number
  type?: 'line' | 'card' | 'list'
}>()

const lineWidths = ['85%', '65%', '75%', '55%', '90%', '60%', '80%', '70%']
</script>

<template>
  <div v-if="type === 'card'" class="space-y-4">
    <div
      v-for="i in (rows ?? 3)"
      :key="i"
      class="animate-pulse rounded-xl bg-gray-100 p-6"
    >
      <div class="mb-3 h-4 w-3/4 rounded bg-gray-200" />
      <div class="mb-2 h-3 w-1/2 rounded bg-gray-200" />
      <div class="h-3 w-1/3 rounded bg-gray-200" />
    </div>
  </div>
  <div v-else-if="type === 'list'" class="space-y-3">
    <div
      v-for="i in (rows ?? 3)"
      :key="i"
      class="animate-pulse flex items-center gap-4 rounded-lg bg-gray-100 p-4"
    >
      <div class="h-10 w-10 rounded-full bg-gray-200" />
      <div class="flex-1 space-y-2">
        <div class="h-3 w-1/3 rounded bg-gray-200" />
        <div class="h-3 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  </div>
  <div v-else class="space-y-3">
    <div
      v-for="i in (rows ?? 3)"
      :key="i"
      class="animate-pulse h-4 rounded bg-gray-100"
      :style="{ width: lineWidths[(i - 1) % lineWidths.length] }"
    />
  </div>
</template>
