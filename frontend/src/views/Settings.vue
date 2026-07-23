<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useNotification } from '@/composables/useNotification'

const { user, fetchProfile, updateProfile } = useAuth()
const { showToast } = useNotification()

const name = ref('')
const isSaving = ref(false)

onMounted(async () => {
  await fetchProfile()
  name.value = user.value?.name ?? ''
})

async function handleSave() {
  if (!name.value.trim()) return
  isSaving.value = true
  try {
    await updateProfile({ name: name.value.trim() })
    showToast('success', '保存成功')
  } catch {
    showToast('error', '保存失败')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="rounded-xl bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">个人设置</h2>
      <div class="max-w-md space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">姓名</label>
          <input
            v-model="name"
            class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            placeholder="请输入姓名"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">邮箱</label>
          <input
            :value="user?.email ?? ''"
            disabled
            class="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500"
          />
        </div>
        <button
          :disabled="isSaving"
          class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          @click="handleSave"
        >
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
    <div class="rounded-xl bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">通知设置</h2>
      <p class="text-sm text-muted">通知偏好设置将在后续版本中添加</p>
    </div>
    <div class="rounded-xl bg-card p-6 shadow-sm">
      <h2 class="mb-4 text-lg font-semibold text-gray-900">关于</h2>
      <div class="text-sm text-muted space-y-1">
        <p>家庭管家 v1.0</p>
        <p>让家庭管理更简单</p>
      </div>
    </div>
  </div>
</template>
