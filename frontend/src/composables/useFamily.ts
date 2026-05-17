import { storeToRefs } from 'pinia'
import { useFamilyStore } from '@/stores/family'

export function useFamily() {
  const familyStore = useFamilyStore()
  const { currentFamily, families, members, currentFamilyId } = storeToRefs(familyStore)

  return {
    currentFamily,
    families,
    members,
    currentFamilyId,
    fetchFamilies: familyStore.fetchFamilies,
    setCurrentFamily: familyStore.setCurrentFamily,
    createFamily: familyStore.createFamily,
    joinFamily: familyStore.joinFamily,
    fetchMembers: familyStore.fetchMembers,
    updateMemberRole: familyStore.updateMemberRole,
    removeMember: familyStore.removeMember,
    regenerateInviteCode: familyStore.regenerateInviteCode,
  }
}
