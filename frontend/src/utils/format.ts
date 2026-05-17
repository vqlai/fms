import { format as dateFnsFormat, formatDistanceToNow, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: string | Date, formatStr = 'yyyy-MM-dd'): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return dateFnsFormat(d, formatStr, { locale: zhCN })
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true, locale: zhCN })
}

export function formatMonth(month: string): string {
  const [year, monthNum] = month.split('-')
  return `${year}年${parseInt(monthNum)}月`
}

export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}
