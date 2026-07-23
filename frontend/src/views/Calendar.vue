<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSchedule } from '@/composables/useSchedule'
import { useNotification } from '@/composables/useNotification'
import { useFamily } from '@/composables/useFamily'
import EmptyState from '@/components/common/EmptyState.vue'
import Skeleton from '@/components/common/Skeleton.vue'

const { schedules, isLoading, error, fetchSchedules, createSchedule, updateSchedule, deleteSchedule } = useSchedule()
const { members, fetchMembers } = useFamily()
const { showToast } = useNotification()

const currentMonth = ref(new Date().toISOString().slice(0, 7))
const showForm = ref(false)
const editingId = ref<string | null>(null)

const form = ref({
  title: '',
  startTime: new Date().toISOString().slice(0, 10) + 'T09:00',
  endTime: '',
  isAllDay: false,
  note: '',
  participantIds: [] as string[],
  reminderMinutes: [] as number[],
})

onMounted(async () => {
  await fetchMembers()
  await loadMonth()
})

async function loadMonth() {
  const [year, month] = currentMonth.value.split('-')
  const lastDay = new Date(+year, +month, 0).getDate()
  const startDate = `${year}-${month}-01`
  const endDate = `${year}-${month}-${String(lastDay).padStart(2, '0')}`
  await fetchSchedules({ startDate, endDate })
}

function prevMonth() {
  const d = new Date(currentMonth.value + '-01')
  d.setMonth(d.getMonth() - 1)
  currentMonth.value = d.toISOString().slice(0, 7)
  loadMonth()
}

function nextMonth() {
  const d = new Date(currentMonth.value + '-01')
  d.setMonth(d.getMonth() + 1)
  currentMonth.value = d.toISOString().slice(0, 7)
  loadMonth()
}

function openCreateForm(day?: string) {
  editingId.value = null
  const dateStr = day ?? new Date().toISOString().slice(0, 10)
  form.value = {
    title: '',
    startTime: dateStr + 'T09:00',
    endTime: '',
    isAllDay: false,
    note: '',
    participantIds: [],
    reminderMinutes: [],
  }
  showForm.value = true
}

function openEditForm(schedule: typeof schedules.value[0]) {
  editingId.value = schedule.id
  const start = new Date(schedule.startTime)
  form.value = {
    title: schedule.title,
    startTime: schedule.startTime.slice(0, 16),
    endTime: schedule.endTime?.slice(0, 16) ?? '',
    isAllDay: schedule.isAllDay,
    note: schedule.note ?? '',
    participantIds: schedule.participants.map((p) => p.userId),
    reminderMinutes: schedule.reminders.map((r) => {
      const diff = start.getTime() - new Date(r.remindAt).getTime()
      return Math.round(diff / 60000)
    }),
  }
  showForm.value = true
}

async function handleSubmit() {
  if (!form.value.title.trim()) return
  try {
    const data = {
      title: form.value.title.trim(),
      startTime: new Date(form.value.startTime).toISOString(),
      endTime: form.value.endTime ? new Date(form.value.endTime).toISOString() : undefined,
      isAllDay: form.value.isAllDay,
      note: form.value.note || undefined,
      participantIds: form.value.participantIds.length ? form.value.participantIds : undefined,
      reminderMinutes: form.value.reminderMinutes.length ? form.value.reminderMinutes : undefined,
    }
    if (editingId.value) {
      await updateSchedule(editingId.value, data)
      showToast('success', '更新日程成功')
    } else {
      await createSchedule(data)
      showToast('success', '创建日程成功')
    }
    showForm.value = false
    loadMonth()
  } catch {
    showToast('error', '操作失败')
  }
}

async function handleDelete(id: string) {
  try {
    await deleteSchedule(id)
    showToast('success', '删除日程成功')
    loadMonth()
  } catch {
    showToast('error', '删除失败')
  }
}

function getMonthDays() {
  const [year, month] = currentMonth.value.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const startOffset = firstDay.getDay()
  const days: Array<{ date: string; day: number; isCurrentMonth: boolean }> = []
  for (let i = 0; i < startOffset; i++) {
    const d = new Date(year, month - 1, -startOffset + i + 1)
    days.push({ date: d.toISOString().slice(0, 10), day: d.getDate(), isCurrentMonth: false })
  }
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month - 1, i)
    days.push({ date: d.toISOString().slice(0, 10), day: i, isCurrentMonth: true })
  }
  return days
}

function getSchedulesForDay(date: string) {
  return schedules.value.filter((s) => s.startTime.slice(0, 10) === date)
}

const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const memberOptions = computed(() => members.value.map((m) => ({ id: m.user.id, name: m.user.name })))
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-semibold text-gray-900">家庭日历</h2>
      <button class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700" @click="openCreateForm()">
        新建日程
      </button>
    </div>

    <div class="flex items-center justify-between rounded-lg bg-card px-4 py-3 shadow-sm">
      <button class="rounded p-1 hover:bg-gray-100" @click="prevMonth">◀</button>
      <span class="font-semibold text-gray-900">{{ currentMonth }}</span>
      <button class="rounded p-1 hover:bg-gray-100" @click="nextMonth">▶</button>
    </div>

    <div v-if="isLoading"><Skeleton type="card" :rows="4" /></div>
    <div v-else-if="error" class="rounded-xl bg-danger-50 p-4 text-sm text-danger-600">{{ error }}</div>
    <div v-else class="rounded-xl bg-card shadow-sm overflow-hidden">
      <div class="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        <div v-for="d in weekDays" :key="d" class="px-2 py-2 text-center text-xs font-medium text-muted">{{ d }}</div>
      </div>
      <div class="grid grid-cols-7">
        <div
          v-for="day in getMonthDays()"
          :key="day.date"
          class="min-h-[80px] border-b border-r border-gray-100 p-1 cursor-pointer transition-colors hover:bg-gray-50"
          :class="{ 'bg-gray-50': !day.isCurrentMonth }"
          @click="openCreateForm(day.date)"
        >
          <span class="inline-flex h-6 w-6 items-center justify-center rounded-full text-xs" :class="day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'">
            {{ day.day }}
          </span>
          <div class="space-y-0.5 mt-0.5">
            <div
              v-for="s in getSchedulesForDay(day.date).slice(0, 3)"
              :key="s.id"
              class="truncate rounded bg-primary-100 px-1 py-0.5 text-xs text-primary-700"
              @click.stop="openEditForm(s)"
            >
              {{ s.isAllDay ? '📌' : '🕐' }} {{ s.title }}
            </div>
            <div v-if="getSchedulesForDay(day.date).length > 3" class="text-xs text-muted px-1">
              +{{ getSchedulesForDay(day.date).length - 3 }} 更多
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="rounded-xl bg-card p-4 shadow-sm">
      <h3 class="mb-3 text-sm font-medium text-gray-900">日程列表</h3>
      <EmptyState v-if="schedules.length === 0" icon="📅" title="本月暂无日程" />
      <div v-else class="space-y-2">
        <div
          v-for="s in schedules.slice(0, 10)"
          :key="s.id"
          class="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 cursor-pointer hover:bg-gray-100"
          @click="openEditForm(s)"
        >
          <div>
            <p class="text-sm font-medium text-gray-900">{{ s.title }}</p>
            <p class="text-xs text-muted">
              {{ new Date(s.startTime).toLocaleString('zh-CN') }}
              <span v-if="s.participants.length">· {{ s.participants.length }}人</span>
            </p>
          </div>
          <button class="rounded p-1 text-gray-400 hover:text-danger-500" @click.stop="handleDelete(s.id)">🗑</button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 flex justify-end">
        <div class="absolute inset-0 bg-black/30" @click="showForm = false" />
        <div class="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
          <div class="flex items-center justify-between border-b px-6 py-4">
            <h3 class="text-lg font-semibold">{{ editingId ? '编辑日程' : '新建日程' }}</h3>
            <button class="text-gray-400 hover:text-gray-600" @click="showForm = false">✕</button>
          </div>
          <div class="flex-1 overflow-auto p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">标题</label>
              <input v-model="form.title" maxlength="200" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="日程标题" />
            </div>
            <label class="flex items-center gap-2 text-sm">
              <input v-model="form.isAllDay" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary-600" /> 全天事件
            </label>
            <div v-if="!form.isAllDay">
              <label class="block text-sm font-medium text-gray-700">开始时间</label>
              <input v-model="form.startTime" type="datetime-local" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div v-if="!form.isAllDay">
              <label class="block text-sm font-medium text-gray-700">结束时间</label>
              <input v-model="form.endTime" type="datetime-local" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">参与成员</label>
              <div class="mt-1 space-y-1 border rounded-lg p-2">
                <label v-for="m in memberOptions" :key="m.id" class="flex items-center gap-2 text-sm py-1">
                  <input v-model="form.participantIds" :value="m.id" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-primary-600" /> {{ m.name }}
                </label>
                <p v-if="memberOptions.length === 0" class="text-xs text-muted">暂无成员</p>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">备注</label>
              <input v-model="form.note" class="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" placeholder="可选" />
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
