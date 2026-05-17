<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useExpense } from '@/composables/useExpense'
import { useNotification } from '@/composables/useNotification'
import { formatCurrency } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'
import Skeleton from '@/components/common/Skeleton.vue'

const { budgets, categories, isLoading, fetchBudgets, fetchCategories, createBudget, updateBudget, deleteBudget } = useExpense()
const { showToast } = useNotification()

const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ categoryId: '', amount: 0 })

onMounted(async () => {
  await fetchCategories()
  await fetchBudgets()
})

const availableCategories = computed(() => {
  const budgetedIds = new Set(budgets.value.map((b) => b.categoryId))
  return (categories.value ?? []).filter((c) => c.type === 'expense' && (!budgetedIds.has(c.id) || editingId.value === c.id))
})

function openCreateForm() {
  editingId.value = null
  form.value = { categoryId: '', amount: 0 }
  showForm.value = true
}

function openEditForm(budget: typeof budgets.value[0]) {
  editingId.value = budget.id
  form.value = { categoryId: budget.categoryId, amount: budget.amount }
  showForm.value = true
}

async function handleSubmit() {
  if (!form.value.categoryId || !form.value.amount) return
  try {
    if (editingId.value) {
      await updateBudget(editingId.value, { amount: form.value.amount })
      showToast('success', '更新预算成功')
    } else {
      await createBudget({ categoryId: form.value.categoryId, amount: form.value.amount })
      showToast('success', '设置预算成功')
    }
    showForm.value = false
  } catch {
    showToast('error', '操作失败')
  }
}

async function handleDelete(id: string) {
  try {
    await deleteBudget(id)
    showToast('success', '删除预算成功')
  } catch {
    showToast('error', '删除失败')
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">预算管理</h2>
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700" @click="openCreateForm">
        设置预算
      </button>
    </div>

    <div v-if="isLoading">
      <Skeleton type="card" :rows="3" />
    </div>
    <div v-else-if="budgets.length === 0">
      <EmptyState icon="📊" title="暂无预算" description="点击右上角为支出分类设置预算" />
    </div>
    <div v-else class="space-y-3">
      <div v-for="budget in budgets" :key="budget.id" class="rounded-xl bg-card p-5 shadow-sm" @click="openEditForm(budget)">
        <div class="mb-3 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-lg">{{ budget.category.icon }}</span>
            <span class="font-medium text-gray-900">{{ budget.category.name }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-muted">
              <span class="font-semibold text-gray-900">{{ formatCurrency(budget.spent) }}</span>
              / {{ formatCurrency(budget.amount) }}
            </span>
            <button class="rounded p-1 text-gray-400 hover:text-danger-500" @click.stop="handleDelete(budget.id)">🗑</button>
          </div>
        </div>
        <div class="h-3 overflow-hidden rounded-full bg-gray-100">
          <div
            class="h-full rounded-full transition-all duration-300"
            :class="budget.spent / budget.amount >= 1 ? 'bg-danger-500' : budget.spent / budget.amount >= 0.8 ? 'bg-warning-500' : 'bg-primary-500'"
            :style="{ width: `${Math.min(budget.spent / budget.amount * 100, 100)}%` }"
          />
        </div>
        <div class="mt-2 flex justify-between text-xs text-muted">
          <span>{{ Math.round(budget.spent / budget.amount * 100) }}%</span>
          <span :class="budget.spent > budget.amount ? 'text-danger-500 font-medium' : ''">
            {{ budget.spent > budget.amount ? '已超支' : `剩余 ${formatCurrency(budget.amount - budget.spent)}` }}
          </span>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30" @click="showForm = false" />
        <div class="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <h3 class="mb-4 text-lg font-semibold">{{ editingId ? '编辑预算' : '设置预算' }}</h3>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">分类</label>
              <select v-model="form.categoryId" :disabled="!!editingId" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 disabled:bg-gray-100">
                <option value="">选择分类</option>
                <option v-for="cat in availableCategories" :key="cat.id" :value="cat.id">{{ cat.icon }} {{ cat.name }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">预算金额</label>
              <input v-model.number="form.amount" type="number" min="0.01" step="0.01" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="0.00" />
            </div>
          </div>
          <div class="mt-6 flex justify-end gap-3">
            <button class="rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="showForm = false">取消</button>
            <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700" @click="handleSubmit">保存</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
