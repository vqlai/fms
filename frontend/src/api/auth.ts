import http from './axios'
import type { ApiResponse } from '@/types/api'
import type { Family } from '@/types/family'

interface LoginDto {
  email: string
  password: string
}

interface RegisterDto {
  name: string
  email: string
  password: string
}

interface AuthResult {
  accessToken: string
  refreshToken: string
  user: {
    id: string
    name: string
    email: string
  }
  families: Family[]
}

export const authApi = {
  login(data: LoginDto) {
    return http.post<ApiResponse<AuthResult>>('/auth/login', data)
  },

  register(data: RegisterDto) {
    return http.post<ApiResponse<AuthResult>>('/auth/register', data)
  },

  switchFamily(familyId: string) {
    return http.post<ApiResponse<AuthResult>>('/auth/switch-family', { familyId })
  },

  getProfile() {
    return http.get<ApiResponse<{ id: string; name: string; email: string; avatar: string | null }>>('/user/profile')
  },

  updateProfile(data: { name?: string; avatar?: string }) {
    return http.patch<ApiResponse<{ id: string; name: string; email: string; avatar: string | null }>>('/user/profile', data)
  },
}
