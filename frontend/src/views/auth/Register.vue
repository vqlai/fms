<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { registerSchema } from '@/utils/validate'
import { useAuth } from '@/composables/useAuth'
import { useNotification } from '@/composables/useNotification'

const router = useRouter()
const { register } = useAuth()
const { showToast } = useNotification()

const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(registerSchema),
})

const { value: name, errorMessage: nameError } = useField<string>('name')
const { value: email, errorMessage: emailError } = useField<string>('email')
const { value: password, errorMessage: passwordError } = useField<string>('password')
const { value: confirmPassword, errorMessage: confirmPasswordError } = useField<string>('confirmPassword')

const onSubmit = handleSubmit(async (values) => {
  try {
    const { confirmPassword, ...registerData } = values
    await register(registerData as { name: string; email: string; password: string })
    showToast('success', '注册成功')
    router.push('/')
  } catch {
    showToast('error', '注册失败，请稍后重试')
  }
})
</script>

<template>
  <div>
    <h2 class="mb-6 text-center text-2xl font-semibold text-gray-900">注册</h2>
    <form class="space-y-4" @submit="onSubmit">
      <div>
        <label class="block text-sm font-medium text-gray-700">姓名</label>
        <input
          v-model="name"
          name="name"
          class="mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          :class="nameError ? 'border-danger-500' : 'border-gray-300'"
          placeholder="请输入姓名"
        />
        <p v-if="nameError" class="mt-1 text-xs text-danger-500">{{ nameError }}</p>
      </div>
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
          placeholder="至少 8 位，包含字母和数字"
        />
        <p v-if="passwordError" class="mt-1 text-xs text-danger-500">{{ passwordError }}</p>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">确认密码</label>
        <input
          v-model="confirmPassword"
          name="confirmPassword"
          type="password"
          class="mt-1 block w-full rounded-lg border px-3 py-2 shadow-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          :class="confirmPasswordError ? 'border-danger-500' : 'border-gray-300'"
          placeholder="再次输入密码"
        />
        <p v-if="confirmPasswordError" class="mt-1 text-xs text-danger-500">{{ confirmPasswordError }}</p>
      </div>
      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {{ isSubmitting ? '注册中...' : '注册' }}
      </button>
    </form>
    <p class="mt-4 text-center text-sm text-muted">
      已有账号？
      <router-link to="/auth/login" class="font-medium text-primary-600 hover:text-primary-500">
        立即登录
      </router-link>
    </p>
  </div>
</template>
