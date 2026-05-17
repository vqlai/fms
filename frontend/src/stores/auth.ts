import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@/api/auth'
import { TOKEN_KEY, REFRESH_TOKEN_KEY, CURRENT_FAMILY_KEY } from '@/utils/constants'
import type { Family } from '@/types/family'

interface User {
  id: string
  name: string
  email: string
}

interface AuthSuccessPayload {
  accessToken: string
  refreshToken: string
  user: User
  families: Family[]
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem(TOKEN_KEY))
  const families = ref<Family[]>([])

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  function onAuthSuccess(payload: AuthSuccessPayload) {
    token.value = payload.accessToken
    user.value = payload.user
    families.value = payload.families
    localStorage.setItem(TOKEN_KEY, payload.accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, payload.refreshToken)
  }

  async function login(credentials: { email: string; password: string }) {
    const response = await authApi.login(credentials)
    onAuthSuccess(response.data)
  }

  async function register(data: { name: string; email: string; password: string }) {
    const response = await authApi.register(data)
    onAuthSuccess(response.data)
  }

  function logout() {
    token.value = null
    user.value = null
    families.value = []
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(CURRENT_FAMILY_KEY)
  }

  async function fetchProfile() {
    const response = await authApi.getProfile()
    user.value = response.data
  }

  return { user, token, families, isAuthenticated, login, register, logout, fetchProfile }
})
