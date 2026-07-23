export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const CURRENT_FAMILY_KEY = 'current_family_id'

export const PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100

export const INVITE_CODE_EXPIRY_HOURS = 24

export const BUDGET_WARNING_THRESHOLD = 0.8
export const BUDGET_DANGER_THRESHOLD = 1.0

export const EXPIRY_WARNING_DAYS = 7

export const PRESET_EXPENSE_CATEGORIES = [
  { name: '餐饮', icon: '🍜', type: 'expense' },
  { name: '交通', icon: '🚗', type: 'expense' },
  { name: '住房', icon: '🏠', type: 'expense' },
  { name: '水电', icon: '⚡', type: 'expense' },
  { name: '教育', icon: '📚', type: 'expense' },
  { name: '医疗', icon: '💊', type: 'expense' },
  { name: '购物', icon: '🛒', type: 'expense' },
  { name: '娱乐', icon: '🎮', type: 'expense' },
  { name: '信用卡还款', icon: '💳', type: 'expense' },
  { name: '通讯', icon: '📱', type: 'expense' },
  { name: '人情', icon: '🎁', type: 'expense' },
  { name: '宠物', icon: '🐱', type: 'expense' },
  { name: '其他', icon: '💰', type: 'expense' },
]

export const PRESET_INCOME_CATEGORIES = [
  { name: '工资', icon: '💵', type: 'income' },
  { name: '奖金', icon: '🎁', type: 'income' },
  { name: '投资收益', icon: '📈', type: 'income' },
  { name: '房租收入', icon: '🏠', type: 'income' },
  { name: '其他', icon: '💰', type: 'income' },
]

export const INVENTORY_CATEGORIES = [
  { value: 'fresh_food', label: '食材生鲜', icon: '🥬' },
  { value: 'dry_food', label: '调料干货', icon: '🧂' },
  { value: 'cleaning', label: '清洁用品', icon: '🧹' },
  { value: 'medicine', label: '药品保健', icon: '💊' },
  { value: 'personal_care', label: '个护美妆', icon: '🧴' },
  { value: 'tools', label: '工具杂项', icon: '🔧' },
  { value: 'other', label: '其他', icon: '📦' },
] as const

export const ERROR_MESSAGES: Record<number, string> = {
  1000: '请求参数错误',
  2000: '未登录或登录已过期',
  2001: '没有权限执行此操作',
  3000: '业务逻辑错误',
  4000: '资源不存在',
  5000: '系统错误，请稍后重试',
}
