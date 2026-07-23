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

interface UserProfile {
  id: string
  name: string
  email: string
  phone?: string
  avatarUrl: string | null
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
    return http.get<ApiResponse<UserProfile>>('/user/profile')
  },

  updateProfile(data: { name?: string; avatarUrl?: string }) {
    return http.patch<ApiResponse<UserProfile>>('/user/profile', data)
  },
}
