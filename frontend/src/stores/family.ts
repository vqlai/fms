import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { familyApi } from '@/api/family'
import { CURRENT_FAMILY_KEY } from '@/utils/constants'
import type { Family, FamilyMember } from '@/types/family'

export const useFamilyStore = defineStore('family', () => {
  const currentFamily = ref<Family | null>(null)
  const families = ref<Family[]>([])
  const members = ref<FamilyMember[]>([])

  const currentFamilyId = computed(() => currentFamily.value?.id ?? localStorage.getItem(CURRENT_FAMILY_KEY))

  async function fetchFamilies() {
    const response = await familyApi.getList()
    families.value = response.data
    if (response.data.length > 0) {
      const storedId = localStorage.getItem(CURRENT_FAMILY_KEY)
      const hasValid = storedId && response.data.some((f) => f.id === storedId)
      if (!hasValid) {
        setCurrentFamily(response.data[0])
      } else if (!currentFamily.value) {
        const found = response.data.find((f) => f.id === storedId)
        if (found) setCurrentFamily(found)
      }
    }
  }

  function setCurrentFamily(family: Family) {
    currentFamily.value = family
    localStorage.setItem(CURRENT_FAMILY_KEY, family.id)
    fetchMembers()
  }

  async function createFamily(name: string) {
    await familyApi.create({ name })
    await fetchFamilies()
  }

  async function joinFamily(inviteCode: string) {
    await familyApi.join({ inviteCode })
    await fetchFamilies()
  }

  async function fetchMembers() {
    if (!currentFamilyId.value) return
    const response = await familyApi.getMembers()
    members.value = response.data
  }

  async function updateMemberRole(memberId: string, role: string) {
    await familyApi.updateMemberRole(memberId, role)
    await fetchMembers()
  }

  async function removeMember(memberId: string) {
    await familyApi.removeMember(memberId)
    await fetchMembers()
  }

  async function regenerateInviteCode() {
    const response = await familyApi.regenerateInviteCode()
    if (currentFamily.value) {
      currentFamily.value.inviteCode = response.data.inviteCode
      currentFamily.value.inviteCodeExpiresAt = response.data.expiresAt
    }
  }

  return {
    currentFamily,
    families,
    members,
    currentFamilyId,
    fetchFamilies,
    setCurrentFamily,
    createFamily,
    joinFamily,
    fetchMembers,
    updateMemberRole,
    removeMember,
    regenerateInviteCode,
  }
})
