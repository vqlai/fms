import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth'

export function useAuth() {
  const authStore = useAuthStore()
  const { user, families, isAuthenticated } = storeToRefs(authStore)

  return {
    user,
    isLoggedIn: isAuthenticated,
    families,
    login: authStore.login,
    register: authStore.register,
    logout: authStore.logout,
    fetchProfile: authStore.fetchProfile,
  }
}
