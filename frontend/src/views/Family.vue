<script setup lang="ts">
import { ref } from 'vue'
import { useFamily } from '@/composables/useFamily'

const { currentFamily, members, createFamily, joinFamily, regenerateInviteCode } = useFamily()
const inviteCode = ref('')
const newFamilyName = ref('')
const isCreating = ref(false)

async function handleJoinFamily() {
  if (inviteCode.value) {
    await joinFamily(inviteCode.value)
  }
}

async function handleCreateFamily() {
  const name = newFamilyName.value.trim()
  if (!name) return
  isCreating.value = true
  try {
    await createFamily(name)
    newFamilyName.value = ''
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-xl bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">家庭信息</h2>
      <div v-if="currentFamily" class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-muted">家庭名称</span>
          <span class="font-medium">{{ currentFamily.name }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-muted">邀请码</span>
          <div class="flex items-center gap-2">
            <code class="rounded bg-gray-100 px-2 py-1 text-sm font-mono">
              {{ currentFamily.inviteCode ?? '暂无' }}
            </code>
            <button
              class="text-sm text-primary-600 hover:text-primary-500"
              @click="regenerateInviteCode"
            >
              刷新
            </button>
          </div>
        </div>
      </div>
      <div v-else class="space-y-3">
        <p class="text-sm text-muted">还没有家庭组？创建或加入一个家庭</p>
        <div>
          <label class="block text-sm font-medium text-gray-700">创建家庭</label>
          <div class="mt-1 flex gap-2">
            <input
              v-model="newFamilyName"
              placeholder="输入家庭名称"
              class="block flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              :disabled="isCreating || !newFamilyName.trim()"
              class="rounded-lg bg-primary-600 px-4 py-2 text-sm text-white hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
              @click="handleCreateFamily"
            >
              {{ isCreating ? '创建中...' : '创建' }}
            </button>
          </div>
        </div>
        <div class="border-t border-gray-200 pt-3">
          <label class="block text-sm font-medium text-gray-700">加入家庭</label>
          <div class="mt-1 flex gap-2">
            <input
              v-model="inviteCode"
              placeholder="输入邀请码"
              class="block flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            <button
              class="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
              @click="handleJoinFamily"
            >
              加入
            </button>
          </div>
        </div>
      </div>
    </div>
    <div class="rounded-xl bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">家庭成员</h2>
      <div v-if="members.length === 0" class="text-sm text-muted">暂无成员</div>
      <div v-else class="space-y-3">
        <div v-for="member in members" :key="member.id" class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-medium">
              {{ member.user.name[0] }}
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ member.user.name }}</p>
              <p class="text-xs text-muted">{{ member.role === 'creator' ? '管理员' : member.role === 'member' ? '成员' : '访客' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
