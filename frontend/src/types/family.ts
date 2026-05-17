export type MemberRole = 'creator' | 'member' | 'viewer'

export interface Family {
  id: string
  name: string
  inviteCode: string | null
  inviteCodeExpiresAt: string | null
  createdAt: string
  updatedAt: string
}

export interface FamilyMember {
  id: string
  userId: string
  familyId: string
  role: MemberRole
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
  joinedAt: string
}

export interface CreateFamilyDto {
  name: string
}

export interface JoinFamilyDto {
  inviteCode: string
}
