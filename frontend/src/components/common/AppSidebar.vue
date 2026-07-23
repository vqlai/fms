<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useUiStore } from '@/stores/ui'
import { useFamily } from '@/composables/useFamily'

const route = useRoute()
const uiStore = useUiStore()
const { currentFamily } = useFamily()

const navItems = [
  { name: '仪表盘', path: '/', icon: '🏠' },
  { name: '财务管理', path: '/expenses', icon: '💰' },
  { name: '预算管理', path: '/budgets', icon: '📊' },
  { name: '统计报表', path: '/reports', icon: '📈' },
  { name: '家庭日历', path: '/calendar', icon: '📅' },
  { name: '待办清单', path: '/todos', icon: '✅' },
  { name: '物品库存', path: '/inventory', icon: '📦' },
  { name: '采购清单', path: '/shopping-list', icon: '🛒' },
  { name: '家庭成员', path: '/family', icon: '👨‍👩‍👧‍👦' },
  { name: '设置', path: '/settings', icon: '⚙️' },
]

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const sidebarClass = computed(() =>
  uiStore.sidebarCollapsed ? 'w-16' : 'w-60',
)
</script>

<template>
  <aside
    class="flex flex-col border-r border-gray-200 bg-white transition-all duration-200"
    :class="sidebarClass"
  >
    <div class="flex h-16 items-center justify-center border-b border-gray-200">
      <span v-if="!uiStore.sidebarCollapsed" class="text-xl font-bold text-primary-600">
        家庭管家
      </span>
      <span v-else class="text-xl font-bold text-primary-600">管</span>
    </div>
    <div v-if="!uiStore.sidebarCollapsed && currentFamily" class="border-b border-gray-200 px-4 py-3">
      <div class="text-sm text-muted">当前家庭</div>
      <div class="truncate font-medium text-gray-900">{{ currentFamily.name }}</div>
    </div>
    <nav class="flex-1 overflow-y-auto p-2">
      <router-link
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        :data-nav="item.path"
        :aria-label="item.name"
        class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
        :class="isActive(item.path)
          ? 'bg-primary-50 text-primary-700'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'"
      >
        <span class="text-lg" aria-hidden="true">{{ item.icon }}</span>
        <span v-if="!uiStore.sidebarCollapsed">{{ item.name }}</span>
      </router-link>
    </nav>
  </aside>
</template>
