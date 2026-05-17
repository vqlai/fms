<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useExpense } from '@/composables/useExpense'
import { formatCurrency } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'
import Skeleton from '@/components/common/Skeleton.vue'

const { report, isFetchingReport, fetchReport } = useExpense()

const period = ref('thisMonth')
const periods = [
  { value: 'thisMonth', label: '本月' },
  { value: 'lastMonth', label: '上月' },
  { value: 'last3Months', label: '近3月' },
  { value: 'last6Months', label: '近6月' },
]

onMounted(() => {
  fetchReport()
})

function changePeriod(val: string) {
  period.value = val
  const now = new Date()
  let start: string
  switch (val) {
    case 'lastMonth': start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 10); break
    case 'last3Months': start = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString().slice(0, 10); break
    case 'last6Months': start = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().slice(0, 10); break
    default: start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10)
  }
  fetchReport({ startDate: start })
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">统计报表</h2>
      <div class="flex rounded-lg border border-gray-300 p-1">
        <button
          v-for="p in periods"
          :key="p.value"
          class="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
          :class="period === p.value ? 'bg-primary-600 text-white' : 'text-muted hover:text-gray-700'"
          @click="changePeriod(p.value)"
        >
          {{ p.label }}
        </button>
      </div>
    </div>

    <Skeleton v-if="isFetchingReport" type="card" :rows="3" />
    <EmptyState v-else-if="!report || (report.summary.totalIncome === 0 && report.summary.totalExpense === 0)" icon="📈" title="暂无统计数据" description="记录收支后即可查看统计图表" />
    <template v-else>
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div class="rounded-xl bg-card p-6 shadow-sm">
          <p class="text-sm text-muted">总收入</p>
          <p class="mt-2 text-2xl font-semibold text-success-500">{{ formatCurrency(report.summary.totalIncome) }}</p>
        </div>
        <div class="rounded-xl bg-card p-6 shadow-sm">
          <p class="text-sm text-muted">总支出</p>
          <p class="mt-2 text-2xl font-semibold text-danger-500">{{ formatCurrency(report.summary.totalExpense) }}</p>
        </div>
        <div class="rounded-xl bg-card p-6 shadow-sm">
          <p class="text-sm text-muted">结余</p>
          <p class="mt-2 text-2xl font-semibold text-gray-900">{{ formatCurrency(report.summary.balance) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div class="rounded-xl bg-card p-6 shadow-sm">
          <h3 class="mb-4 font-medium text-gray-900">支出分类占比</h3>
          <div class="space-y-2">
            <div v-for="item in report.categoryBreakdown" :key="item.categoryId" class="flex items-center gap-3">
              <span class="w-20 truncate text-sm text-gray-700">{{ item.categoryName }}</span>
              <div class="flex-1 h-3 overflow-hidden rounded-full bg-gray-100">
                <div class="h-full rounded-full bg-primary-500" :style="{ width: `${item.percentage}%` }" />
              </div>
              <span class="w-24 text-right text-sm text-muted">{{ formatCurrency(item.amount) }} ({{ Math.round(item.percentage) }}%)</span>
            </div>
          </div>
        </div>
        <div class="rounded-xl bg-card p-6 shadow-sm">
          <h3 class="mb-4 font-medium text-gray-900">成员支出占比</h3>
          <div class="space-y-2">
            <div v-for="item in report.memberBreakdown" :key="item.userId" class="flex items-center gap-3">
              <span class="w-20 truncate text-sm text-gray-700">{{ item.userName }}</span>
              <div class="flex-1 h-3 overflow-hidden rounded-full bg-gray-100">
                <div class="h-full rounded-full bg-warning-500" :style="{ width: `${item.percentage}%` }" />
              </div>
              <span class="w-24 text-right text-sm text-muted">{{ formatCurrency(item.amount) }} ({{ Math.round(item.percentage) }}%)</span>
            </div>
          </div>
        </div>
      </div>

      <div class="rounded-xl bg-card p-6 shadow-sm">
        <h3 class="mb-4 font-medium text-gray-900">月度趋势</h3>
        <div class="flex items-end gap-4 h-48">
          <div v-for="item in report.monthlyTrends" :key="item.month" class="flex flex-1 flex-col items-center gap-1">
            <div class="flex w-full flex-col items-center gap-0.5">
              <div
                class="w-full max-w-[40px] rounded-t bg-success-400 transition-all"
                :style="{ height: `${Math.max(item.income / (Math.max(report.monthlyTrends[0]?.income || 1, 1)) * 100, 2)}%` }"
              />
              <div
                class="w-full max-w-[40px] rounded-t bg-danger-400 transition-all"
                :style="{ height: `${Math.max(item.expense / (Math.max(report.monthlyTrends[0]?.expense || 1, 1)) * 100, 2)}%` }"
              />
            </div>
            <span class="text-xs text-muted">{{ item.month.slice(5) }}月</span>
          </div>
        </div>
        <div class="mt-4 flex items-center justify-center gap-6 text-sm">
          <span class="flex items-center gap-1"><span class="h-3 w-3 rounded bg-success-400 inline-block" /> 收入</span>
          <span class="flex items-center gap-1"><span class="h-3 w-3 rounded bg-danger-400 inline-block" /> 支出</span>
        </div>
      </div>
    </template>
  </div>
</template>
