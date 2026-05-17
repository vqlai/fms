<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { loginSchema } from '@/utils/validate'
import { useAuth } from '@/composables/useAuth'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const { login } = useAuth()
const { showToast } = useNotification()

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})

const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')

const onSubmit = handleSubmit(async (values) => {
  try {
    await login(values as { email: string; password: string })
    showToast('success', '登录成功')
    router.push('/')
  } catch {
    showToast('error', '登录失败，请检查邮箱和密码')
  }
})
</script>

<template>
  <div>
    <h2 class="mb-6 text-center text-2xl font-semibold text-gray-900">登录</h2>
    <form class="space-y-4" @submit="onSubmit">
      <div>
        <label class="block text-sm font-medium text-gray-700">邮箱</label>
        <input
          v-model="email"
          name="email"
          type="email"
          class="mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          :class="emailError ? 'border-danger-500' : 'border-gray-300'"
          placeholder="请输入邮箱"
        />
        <p v-if="emailError" class="mt-1 text-xs text-danger-500">{{ emailError }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">密码</label>
        <input
          v-model="password"
          name="password"
          type="password"
          class="mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          :class="passwordError ? 'border-danger-500' : 'border-gray-300'"
          placeholder="请输入密码"
        />
        <p v-if="passwordError" class="mt-1 text-xs text-danger-500">{{ passwordError }}</p>
      </div>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ isSubmitting ? '登录中...' : '登录' }}
      </button>
    </form>
    <p class="mt-4 text-center text-sm text-muted">
      还没有账号？
      <router-link to="/auth/register" class="font-medium text-primary-600 hover:text-primary-500">
        立即注册
      </router-link>
    </p>
  </div>
</template>
