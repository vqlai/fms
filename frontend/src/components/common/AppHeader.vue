<script setup lang="ts">
import { useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const route = useRoute()
const { user, isLoggedIn, logout } = useAuth()

const pageTitles: Record<string, string> = {
  Dashboard: '仪表盘',
  Expenses: '财务管理',
  Budgets: '预算管理',
  Reports: '统计报表',
  Calendar: '家庭日历',
  Todos: '待办清单',
  Inventory: '物品库存',
  ShoppingList: '采购清单',
  Family: '家庭成员',
  Settings: '设置',
}

const title = pageTitles[route.name as string] ?? '家庭管家'

function handleLogout() {
  logout()
}
</script>

<template>
  <header class="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
    <h1 class="text-xl font-semibold text-gray-900">{{ title }}</h1>
    <div v-if="isLoggedIn" class="flex items-center gap-4">
      <span class="text-sm text-muted">{{ user?.name }}</span>
      <button
        class="rounded-lg px-3 py-1.5 text-sm text-gray-600 transition-colors hover:bg-gray-100"
        @click="handleLogout"
      >
        退出
      </button>
    </div>
  </header>
</template>
