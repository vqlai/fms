import { ref, computed } from 'vue'
import { expenseApi } from '@/api/expense'
import type { Expense, CreateExpenseDto, UpdateExpenseDto, QueryExpenseDto, Category, CreateCategoryDto, Budget, CreateBudgetDto, UpdateBudgetDto, ExpenseReport } from '@/types/expense'

export function useExpense() {
  const expenses = ref<Expense[]>([])
  const categories = ref<Category[]>([])
  const budgets = ref<Budget[]>([])
  const report = ref<ExpenseReport | null>(null)
  const pagination = ref({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  })
  const isLoading = ref(false)
  const isFetchingReport = ref(false)
  const error = ref<string | null>(null)

  async function fetchCategories() {
    try {
      const response = await expenseApi.getCategories()
      categories.value = response.data
    } catch {
      error.value = '加载分类失败'
    }
  }

  async function fetchExpenses(params?: QueryExpenseDto) {
    isLoading.value = true
    error.value = null
    try {
      const response = await expenseApi.getList(params)
      expenses.value = response.data
      if ('pagination' in response) {
        pagination.value = (response as Record<string, unknown>).pagination as typeof pagination.value
      }
    } catch {
      error.value = '加载收支记录失败'
    } finally {
      isLoading.value = false
    }
  }

  async function createExpense(data: CreateExpenseDto) {
    const response = await expenseApi.create(data)
    return response.data
  }

  async function updateExpense(id: string, data: UpdateExpenseDto) {
    const response = await expenseApi.update(id, data)
    return response.data
  }

  async function deleteExpense(id: string) {
    await expenseApi.remove(id)
  }

  async function createCategory(data: CreateCategoryDto) {
    const response = await expenseApi.createCategory(data)
    await fetchCategories()
    return response.data
  }

  async function deleteCategory(id: string) {
    await expenseApi.deleteCategory(id)
    await fetchCategories()
  }

  async function fetchReport(params?: { startDate?: string; endDate?: string }) {
    isFetchingReport.value = true
    try {
      const response = await expenseApi.getReport(params)
      report.value = response.data
    } catch {
      error.value = '加载报表失败'
    } finally {
      isFetchingReport.value = false
    }
  }

  async function fetchBudgets() {
    try {
      const response = await expenseApi.getBudgets()
      budgets.value = response.data
    } catch {
      error.value = '加载预算失败'
    }
  }

  async function createBudget(data: CreateBudgetDto) {
    const response = await expenseApi.createBudget(data)
    await fetchBudgets()
    return response.data
  }

  async function updateBudget(id: string, data: UpdateBudgetDto) {
    const response = await expenseApi.updateBudget(id, data)
    await fetchBudgets()
    return response.data
  }

  async function deleteBudget(id: string) {
    await expenseApi.deleteBudget(id)
    await fetchBudgets()
  }

  return {
    expenses: computed(() => expenses.value),
    categories: computed(() => categories.value),
    budgets: computed(() => budgets.value),
    report: computed(() => report.value),
    pagination: computed(() => pagination.value),
    isLoading: computed(() => isLoading.value),
    isFetchingReport: computed(() => isFetchingReport.value),
    error: computed(() => error.value),
    fetchCategories,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    createCategory,
    deleteCategory,
    fetchReport,
    fetchBudgets,
    createBudget,
    updateBudget,
    deleteBudget,
  }
}
