<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useExpense } from '@/composables/useExpense'
import { useNotification } from '@/composables/useNotification'
import { formatCurrency, formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'
import Skeleton from '@/components/common/Skeleton.vue'
import type { ExpenseType, QueryExpenseDto, CreateExpenseDto } from '@/types/expense'

const { expenses, categories, isLoading, error, fetchExpenses, fetchCategories, createExpense, updateExpense, deleteExpense } = useExpense()
const { showToast } = useNotification()

const showForm = ref(false)
const editingExpense = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const showDeleteConfirm = ref(false)

const form = ref<CreateExpenseDto>({
  type: 'expense',
  amount: 0,
  categoryId: '',
  transactionDate: new Date().toISOString().slice(0, 10),
  note: '',
})

const filter = ref<QueryExpenseDto>({ page: 1, pageSize: 20 })

const typeFilter = ref<ExpenseType | ''>('')
const categoryFilter = ref('')

function openCreateForm() {
  editingExpense.value = null
  form.value = {
    type: typeFilter.value || 'expense',
    amount: 0,
    categoryId: categoryFilter.value || '',
    transactionDate: new Date().toISOString().slice(0, 10),
    note: '',
  }
  showForm.value = true
}

function openEditForm(expense: typeof expenses.value[0]) {
  editingExpense.value = expense.id
  form.value = {
    type: expense.type,
    amount: expense.amount,
    categoryId: expense.categoryId,
    transactionDate: expense.transactionDate.slice(0, 10),
    note: expense.note ?? '',
  }
  showForm.value = true
}

async function handleSubmit() {
  if (!form.value.amount || !form.value.categoryId) return
  try {
    if (editingExpense.value) {
      await updateExpense(editingExpense.value, form.value)
      showToast('success', '更新成功')
    } else {
      await createExpense(form.value)
      showToast('success', '记录成功')
    }
    showForm.value = false
    await fetchExpenses(filter.value)
  } catch {
    showToast('error', '操作失败')
  }
}

async function confirmDelete(id: string) {
  deletingId.value = id
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingId.value) return
  try {
    await deleteExpense(deletingId.value)
    showToast('success', '删除成功')
    showDeleteConfirm.value = false
    await fetchExpenses(filter.value)
  } catch {
    showToast('error', '删除失败')
  }
}

async function applyFilter() {
  filter.value = {}
  if (typeFilter.value) filter.value.type = typeFilter.value
  if (categoryFilter.value) filter.value.categoryId = categoryFilter.value
  filter.value.page = 1
  await fetchExpenses(filter.value)
}

function clearFilter() {
  typeFilter.value = ''
  categoryFilter.value = ''
  filter.value = { page: 1, pageSize: 20 }
  fetchExpenses(filter.value)
}

const filteredCategories = computed(() => {
  if (!typeFilter.value) return categories.value ?? []
  return (categories.value ?? []).filter((c) => c.type === typeFilter.value)
})

onMounted(() => {
  fetchCategories()
  fetchExpenses()
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <h2 class="text-lg font-semibold text-gray-900">收支记录</h2>
      <button
        class="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        @click="openCreateForm"
      >
        <span>＋</span> 记一笔
      </button>
    </div>

    <!-- filters -->
    <div class="flex flex-wrap items-center gap-3 rounded-lg bg-card p-3 shadow-sm">
      <select v-model="typeFilter" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" @change="applyFilter">
        <option value="">全部类型</option>
        <option value="expense">支出</option>
        <option value="income">收入</option>
      </select>
      <select v-model="categoryFilter" class="rounded-lg border border-gray-300 px-3 py-1.5 text-sm" @change="applyFilter">
        <option value="">全部分类</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.icon }} {{ cat.name }}</option>
      </select>
      <button class="text-sm text-muted hover:text-gray-700" @click="clearFilter">清除筛选</button>
    </div>

    <!-- loading -->
    <div v-if="isLoading">
      <Skeleton type="list" :rows="5" />
    </div>

    <!-- error -->
    <div v-else-if="error" class="rounded-xl bg-danger-50 p-4 text-sm text-danger-600">
      {{ error }}
    </div>

    <!-- empty -->
    <div v-else-if="expenses.length === 0">
      <EmptyState icon="💰" title="暂无收支记录" description="点击右上角「记一笔」记录家庭收支">
        <template #action>
          <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700" @click="openCreateForm">
            记一笔
          </button>
        </template>
      </EmptyState>
    </div>

    <!-- list -->
    <div v-else class="space-y-2">
      <div
        v-for="expense in expenses"
        :key="expense.id"
        class="flex cursor-pointer items-center justify-between rounded-lg bg-card p-4 shadow-sm transition-colors hover:bg-gray-50"
        @click="openEditForm(expense)"
      >
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-lg">
            {{ expense.category.icon ?? '💰' }}
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ expense.category.name }}</p>
            <div class="flex items-center gap-2 text-xs text-muted">
              <span>{{ expense.createdBy.name }}</span>
              <span>·</span>
              <span>{{ formatDate(expense.transactionDate) }}</span>
              <span v-if="expense.note">·</span>
              <span v-if="expense.note" class="truncate">{{ expense.note }}</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <p
            class="font-semibold"
            :class="expense.type === 'income' ? 'text-success-500' : 'text-danger-500'"
          >
            {{ expense.type === 'income' ? '+' : '-' }}{{ formatCurrency(expense.amount) }}
          </p>
          <button
            class="rounded p-1 text-gray-400 hover:text-danger-500"
            @click.stop="confirmDelete(expense.id)"
          >
            🗑
          </button>
        </div>
      </div>
    </div>

    <!-- expense form drawer -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/30" @click="showForm = false" />
        <div class="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
          <div class="flex items-center justify-between border-b px-6 py-4">
            <h3 class="text-lg font-semibold">{{ editingExpense ? '编辑记录' : '记一笔' }}</h3>
            <button class="text-gray-400 hover:text-gray-600" @click="showForm = false">✕</button>
          </div>
          <div class="flex-1 overflow-auto p-6 space-y-4">
            <div class="flex rounded-lg border border-gray-300 p-1">
              <button
                class="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
                :class="form.type === 'expense' ? 'bg-danger-100 text-danger-700' : 'text-muted'"
                @click="form.type = 'expense'"
              >
                支出
              </button>
              <button
                class="flex-1 rounded-md py-2 text-sm font-medium transition-colors"
                :class="form.type === 'income' ? 'bg-success-100 text-success-700' : 'text-muted'"
                @click="form.type = 'income'"
              >
                收入
              </button>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">金额</label>
              <input
                v-model.number="form.amount"
                type="number"
                step="0.01"
                min="0.01"
                class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-3 text-2xl font-semibold focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">分类</label>
              <select v-model="form.categoryId" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500">
                <option value="">选择分类</option>
                <option v-for="cat in filteredCategories" :key="cat.id" :value="cat.id">
                  {{ cat.icon }} {{ cat.name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">日期</label>
              <input v-model="form.transactionDate" type="date" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">备注</label>
              <input v-model="form.note" placeholder="可选" maxlength="500" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          </div>
          <div class="border-t px-6 py-4">
            <button class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700" @click="handleSubmit">
              {{ editingExpense ? '更新' : '确认记录' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- delete confirm -->
    <Teleport to="body">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/30" @click="showDeleteConfirm = false" />
        <div class="relative w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
          <h3 class="mb-2 text-lg font-semibold">确认删除</h3>
          <p class="mb-6 text-sm text-muted">删除后将无法恢复，确定要删除这条记录吗？</p>
          <div class="flex justify-end gap-3">
            <button class="rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" @click="showDeleteConfirm = false">取消</button>
            <button class="rounded-lg bg-danger-500 px-4 py-2 text-sm text-white hover:bg-danger-600" @click="handleDelete">确认删除</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
