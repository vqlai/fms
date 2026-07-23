import axios from 'axios'
import type { InternalAxiosRequestConfig, AxiosError, AxiosInstance } from 'axios'
import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY, CURRENT_FAMILY_KEY } from '@/utils/constants'

export interface ApiError {
  status: number
  message: string
}

// 拦截器返回 response.data，运行时返回类型即为 T
type HttpClient = Pick<AxiosInstance, 'create'> & {
  get<T>(url: string, config?: Record<string, unknown>): Promise<T>
  post<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>
  patch<T>(url: string, data?: unknown, config?: Record<string, unknown>): Promise<T>
  delete<T>(url: string, config?: Record<string, unknown>): Promise<T>
}

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const tokenValue = localStorage.getItem(TOKEN_KEY)
  if (tokenValue) {
    config.headers.Authorization = `Bearer ${tokenValue}`
  }
  const familyId = localStorage.getItem(CURRENT_FAMILY_KEY)
  if (familyId) {
    config.headers['X-Family-Id'] = familyId
  }
  return config
})

function getErrorMessage(status: number, fallback?: string): string {
  switch (status) {
    case 400:
      return fallback ?? '请求参数错误'
    case 401:
      return '登录已过期，请重新登录'
    case 403:
      return '您没有执行此操作的权限'
    case 404:
      return '请求的资源不存在'
    case 429:
      return '请求过于频繁，请稍后再试'
    case 500:
      return '服务器内部错误，请稍后重试'
    case 502:
      return '服务暂时不可用，请稍后重试'
    case 503:
      return '服务维护中，请稍后重试'
    default:
      return fallback ?? `请求失败（${status}）`
  }
}

instance.interceptors.response.use(
  (response) => response.data,
  (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status ?? 0

    // 401 直接清除登录态并跳转登录页（后端尚未提供 /auth/refresh 端点）
    if (
      originalRequest &&
      !originalRequest._retry &&
      status === 401 &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      clearAuthAndRedirect()
    }

    const apiMessage =
      (error.response?.data as { message?: string } | undefined)?.message ?? undefined

    const apiError: ApiError = {
      status,
      message: getErrorMessage(status, apiMessage),
    }

    return Promise.reject(apiError)
  },
)

function clearAuthAndRedirect() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  if (!window.location.pathname.startsWith('/auth/')) {
    window.location.href = '/auth/login'
  }
}

const http = instance as unknown as HttpClient

export default http
