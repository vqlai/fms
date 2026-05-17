import http from './axios'
import type { ApiResponse } from '@/types/api'
import type { Family, FamilyMember, CreateFamilyDto, JoinFamilyDto } from '@/types/family'

export const familyApi = {
  getList() {
    return http.get<ApiResponse<Family[]>>('/families')
  },

  getCurrent() {
    return http.get<ApiResponse<Family>>('/families/current')
  },

  create(data: CreateFamilyDto) {
    return http.post<ApiResponse<Family>>('/families', data)
  },

  join(data: JoinFamilyDto) {
    return http.post<ApiResponse<Family>>('/families/join', data)
  },

  getMembers() {
    return http.get<ApiResponse<FamilyMember[]>>('/families/current/members')
  },

  updateMemberRole(memberId: string, role: string) {
    return http.patch<ApiResponse<FamilyMember>>(`/families/current/members/${memberId}`, { role })
  },

  removeMember(memberId: string) {
    return http.delete<ApiResponse<void>>(`/families/current/members/${memberId}`)
  },

  regenerateInviteCode() {
    return http.post<ApiResponse<{ inviteCode: string; expiresAt: string }>>('/families/current/invite-code')
  },
}
