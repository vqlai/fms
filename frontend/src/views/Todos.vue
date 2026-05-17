<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTodo } from '@/composables/useSchedule'
import { useNotification } from '@/composables/useNotification'
import { formatDate } from '@/utils/format'
import EmptyState from '@/components/common/EmptyState.vue'
import Skeleton from '@/components/common/Skeleton.vue'

const { todos, isLoading, error, fetchTodos, createTodo, updateTodo, deleteTodo, toggleTodo } = useTodo()
const { showToast } = useNotification()

const showForm = ref(false)
const editingId = ref<string | null>(null)
const form = ref({ title: '', description: '', priority: 2, dueDate: '' })
const filterStatus = ref<'all' | 'pending' | 'completed'>('all')

onMounted(() => fetchFiltered())

function fetchFiltered() {
  const params: { isCompleted?: boolean } = {}
  if (filterStatus.value === 'pending') params.isCompleted = false
  else if (filterStatus.value === 'completed') params.isCompleted = true
  fetchTodos(params)
}

function openCreateForm() {
  editingId.value = null
  form.value = { title: '', description: '', priority: 2, dueDate: '' }
  showForm.value = true
}

function openEditForm(todo: typeof todos.value[0]) {
  editingId.value = todo.id
  form.value = {
    title: todo.title,
    description: todo.description ?? '',
    priority: todo.priority,
    dueDate: todo.dueDate?.slice(0, 10) ?? '',
  }
  showForm.value = true
}

async function handleSubmit() {
  if (!form.value.title.trim()) return
  try {
    const data = {
      title: form.value.title.trim(),
      description: form.value.description || undefined,
      priority: form.value.priority,
      dueDate: form.value.dueDate || undefined,
    }
    if (editingId.value) {
      await updateTodo(editingId.value, data)
      showToast('success', '更新待办成功')
    } else {
      await createTodo(data)
      showToast('success', '创建待办成功')
    }
    showForm.value = false
    fetchFiltered()
  } catch {
    showToast('error', '操作失败')
  }
}

async function handleToggle(todo: typeof todos.value[0]) {
  try {
    await toggleTodo(todo.id, todo.isCompleted)
    showToast('success', todo.isCompleted ? '已标记为未完成' : '已完成')
    fetchFiltered()
  } catch {
    showToast('error', '操作失败')
  }
}

async function handleDelete(id: string) {
  try {
    await deleteTodo(id)
    showToast('success', '删除成功')
    fetchFiltered()
  } catch {
    showToast('error', '删除失败')
  }
}

const priorityLabel = (p: number) => (p === 1 ? '高' : p === 3 ? '低' : '中')
const priorityColor = (p: number) => (p === 1 ? 'bg-danger-100 text-danger-700' : p === 3 ? 'bg-gray-100 text-gray-600' : 'bg-warning-100 text-warning-700')
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">待办清单</h2>
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700" @click="openCreateForm">
        新建待办
      </button>
    </div>

    <div class="flex gap-2 rounded-lg bg-card p-1 shadow-sm">
      <button
        v-for="s in [{ v: 'all', l: '全部' }, { v: 'pending', l: '未完成' }, { v: 'completed', l: '已完成' }]"
        :key="s.v"
        class="flex-1 rounded-md py-1.5 text-sm font-medium transition-colors"
        :class="filterStatus === s.v ? 'bg-primary-600 text-white' : 'text-muted hover:text-gray-700'"
        @click="filterStatus = s.v as 'all' | 'pending' | 'completed'; fetchFiltered()"
      >
        {{ s.l }}
      </button>
    </div>

    <div v-if="isLoading"><Skeleton type="list" :rows="5" /></div>
    <div v-else-if="error" class="rounded-xl bg-danger-50 p-4 text-sm text-danger-600">{{ error }}</div>
    <div v-else-if="todos.length === 0">
      <EmptyState icon="✅" title="暂无待办事项" description="点击右上角创建家庭待办任务" />
    </div>
    <div v-else class="space-y-2">
      <div
        v-for="todo in todos"
        :key="todo.id"
        class="flex items-center gap-3 rounded-lg bg-card p-4 shadow-sm transition-colors hover:bg-gray-50"
        @click="openEditForm(todo)"
      >
        <input type="checkbox" :checked="todo.isCompleted" class="h-5 w-5 rounded border-gray-300 text-primary-600" @click.stop @change="handleToggle(todo)" />
        <div class="flex-1 min-w-0">
          <p class="truncate font-medium text-gray-900" :class="{ 'line-through text-muted': todo.isCompleted }">{{ todo.title }}</p>
          <div class="flex items-center gap-2 text-xs text-muted">
            <span v-if="todo.dueDate">📅 {{ formatDate(todo.dueDate) }}</span>
            <span class="rounded px-1.5 py-0.5 text-xs font-medium" :class="priorityColor(todo.priority)">{{ priorityLabel(todo.priority) }}</span>
          </div>
        </div>
        <button class="rounded p-1 text-gray-400 hover:text-danger-500" @click.stop="handleDelete(todo.id)">🗑</button>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/30" @click="showForm = false" />
        <div class="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
          <div class="flex items-center justify-between border-b px-6 py-4">
            <h3 class="text-lg font-semibold">{{ editingId ? '编辑待办' : '新建待办' }}</h3>
            <button class="text-gray-400 hover:text-gray-600" @click="showForm = false">✕</button>
          </div>
          <div class="flex-1 overflow-auto p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">标题</label>
              <input v-model="form.title" maxlength="200" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="待办标题" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">描述</label>
              <textarea v-model="form.description" rows="3" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="可选" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">优先级</label>
              <select v-model.number="form.priority" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5">
                <option :value="1">高</option>
                <option :value="2">中</option>
                <option :value="3">低</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">截止日期</label>
              <input v-model="form.dueDate" type="date" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
          </div>
          <div class="border-t px-6 py-4">
            <button class="w-full rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700" @click="handleSubmit">
              {{ editingId ? '更新' : '创建' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
