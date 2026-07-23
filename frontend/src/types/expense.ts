export type ExpenseType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  type: ExpenseType
  icon: string | null
  color: string | null
  isSystem: boolean
  sortOrder: number
}

export interface CreateCategoryDto {
  name: string
  type: 'income' | 'expense'
  icon?: string
  color?: string
  sortOrder?: number
}

export interface Expense {
  id: string
  type: ExpenseType
  amount: number
  categoryId: string
  category: Category
  transactionDate: string
  note: string | null
  imageUrl: string | null
  familyId: string
  createdById: string
  createdBy: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateExpenseDto {
  type: ExpenseType
  amount: number
  categoryId: string
  transactionDate?: string
  note?: string
  imageUrl?: string
}

export interface UpdateExpenseDto extends Partial<CreateExpenseDto> {}

export interface QueryExpenseDto {
  page?: number
  pageSize?: number
  type?: ExpenseType
  categoryId?: string
  userId?: string
  startDate?: string
  endDate?: string
}

export interface Budget {
  id: string
  familyId: string
  categoryId: string
  category: {
    id: string
    name: string
    icon: string | null
    color: string | null
  }
  amount: number
  spent: number
  period: string
  createdAt: string
}

export interface CreateBudgetDto {
  categoryId: string
  amount: number
}

export interface UpdateBudgetDto {
  amount: number
}

export interface ExpenseReport {
  summary: {
    totalIncome: number
    totalExpense: number
    balance: number
    startDate?: string
    endDate?: string
  }
  categoryBreakdown: Array<{
    name: string
    icon: string | null
    color: string | null
    amount: number
    count: number
  }>
  memberBreakdown: Array<{
    name: string
    amount: number
    count: number
  }>
}
