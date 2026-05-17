import http from './axios'
import type { ApiResponse } from '@/types/api'
import type { Expense, CreateExpenseDto, UpdateExpenseDto, QueryExpenseDto, Category, CreateCategoryDto, Budget, CreateBudgetDto, UpdateBudgetDto, ExpenseReport } from '@/types/expense'

export const expenseApi = {
  getList(params?: QueryExpenseDto) {
    return http.get<ApiResponse<Expense[]>>('/expenses', { params })
  },

  create(data: CreateExpenseDto) {
    return http.post<ApiResponse<Expense>>('/expenses', data)
  },

  findOne(id: string) {
    return http.get<ApiResponse<Expense>>(`/expenses/${id}`)
  },

  update(id: string, data: UpdateExpenseDto) {
    return http.patch<ApiResponse<Expense>>(`/expenses/${id}`, data)
  },

  remove(id: string) {
    return http.delete<ApiResponse<void>>(`/expenses/${id}`)
  },

  getReport(params?: { startDate?: string; endDate?: string }) {
    return http.get<ApiResponse<ExpenseReport>>('/expenses/report', { params })
  },

  getCategories() {
    return http.get<ApiResponse<Category[]>>('/expenses/categories')
  },

  createCategory(data: CreateCategoryDto) {
    return http.post<ApiResponse<Category>>('/expenses/categories', data)
  },

  updateCategory(id: string, data: Partial<CreateCategoryDto>) {
    return http.patch<ApiResponse<Category>>(`/expenses/categories/${id}`, data)
  },

  deleteCategory(id: string) {
    return http.delete<ApiResponse<void>>(`/expenses/categories/${id}`)
  },

  getBudgets() {
    return http.get<ApiResponse<Budget[]>>('/expenses/budgets')
  },

  createBudget(data: CreateBudgetDto) {
    return http.post<ApiResponse<Budget>>('/expenses/budgets', data)
  },

  updateBudget(id: string, data: UpdateBudgetDto) {
    return http.patch<ApiResponse<Budget>>(`/expenses/budgets/${id}`, data)
  },

  deleteBudget(id: string) {
    return http.delete<ApiResponse<void>>(`/expenses/budgets/${id}`)
  },
}
