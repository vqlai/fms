<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useFamily } from '@/composables/useFamily'
import { useExpense } from '@/composables/useExpense'
import { formatCurrency } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'
import Skeleton from '@/components/common/Skeleton.vue'

const router = useRouter()
const { fetchFamilies } = useFamily()
const { report, isFetchingReport, budgets, fetchReport, fetchBudgets } = useExpense()

onMounted(async () => {
  await fetchFamilies()
  await Promise.all([fetchReport(), fetchBudgets()])
})

function navigate(path: string) {
  router.push(path)
}
</script>

<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div class="rounded-xl bg-card p-6 shadow-sm">
        <p class="text-sm text-muted">本月收入</p>
        <Skeleton v-if="isFetchingReport" type="line" :rows="1" />
        <p v-else class="mt-2 text-2xl font-semibold text-success-500">
          {{ report ? formatCurrency(report.summary.totalIncome) : '¥0.00' }}
        </p>
      </div>
      <div class="rounded-xl bg-card p-6 shadow-sm">
        <p class="text-sm text-muted">本月支出</p>
        <Skeleton v-if="isFetchingReport" type="line" :rows="1" />
        <p v-else class="mt-2 text-2xl font-semibold text-danger-500">
          {{ report ? formatCurrency(report.summary.totalExpense) : '¥0.00' }}
        </p>
      </div>
      <div class="rounded-xl bg-card p-6 shadow-sm">
        <p class="text-sm text-muted">本月结余</p>
        <Skeleton v-if="isFetchingReport" type="line" :rows="1" />
        <p v-else class="mt-2 text-2xl font-semibold text-gray-900">
          {{ report ? formatCurrency(report.summary.balance) : '¥0.00' }}
        </p>
      </div>
    </div>

    <div class="flex gap-4">
      <button
        class="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-primary-700"
        @click="navigate('/expenses')"
      >
        <span>💰</span> 记一笔
      </button>
      <button
        class="flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-colors hover:bg-gray-50"
        @click="navigate('/calendar')"
      >
        <span>📅</span> 加日程
      </button>
    </div>

    <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div class="rounded-xl bg-card p-6 shadow-sm">
        <h3 class="mb-4 font-medium text-gray-900">预算进度</h3>
        <Skeleton v-if="isFetchingReport" type="line" :rows="3" />
        <div v-else-if="budgets.length === 0">
          <EmptyState icon="📊" title="暂无预算" description="在预算管理中设置本月预算">
            <template #action>
              <button
                class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                @click="navigate('/budgets')"
              >
                设置预算
              </button>
            </template>
          </EmptyState>
        </div>
        <div v-else class="space-y-3">
          <div v-for="budget in budgets" :key="budget.id" class="space-y-1">
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-700">{{ budget.category.icon }} {{ budget.category.name }}</span>
              <span class="text-muted">
                {{ formatCurrency(budget.spent) }} / {{ formatCurrency(budget.amount) }}
              </span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                class="h-full rounded-full transition-all"
                :class="budget.spent / budget.amount >= 1 ? 'bg-danger-500' : budget.spent / budget.amount >= 0.8 ? 'bg-warning-500' : 'bg-primary-500'"
                :style="{ width: `${Math.min(budget.spent / budget.amount * 100, 100)}%` }"
              />
            </div>
          </div>
        </div>
      </div>
      <div class="rounded-xl bg-card p-6 shadow-sm">
        <h3 class="mb-4 font-medium text-gray-900">支出分类占比</h3>
        <Skeleton v-if="isFetchingReport" type="card" :rows="4" />
        <div v-else-if="report && report.categoryBreakdown.length > 0" class="space-y-2">
          <div
            v-for="item in report.categoryBreakdown.slice(0, 5)"
            :key="item.categoryId"
            class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
          >
            <span class="text-sm text-gray-700">{{ item.categoryName }}</span>
            <span class="text-sm font-medium text-muted">{{ formatCurrency(item.amount) }}</span>
          </div>
        </div>
        <EmptyState v-else icon="📈" title="暂无支出数据" description="记录支出后查看分类占比" />
      </div>
    </div>
  </div>
</template>
