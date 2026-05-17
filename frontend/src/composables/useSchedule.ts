import { ref, computed } from 'vue'
import { scheduleApi, todoApi } from '@/api/schedule'
import type { Schedule, CreateScheduleDto, UpdateScheduleDto, QueryScheduleDto, Todo, CreateTodoDto, UpdateTodoDto, QueryTodoDto } from '@/types/schedule'

export function useSchedule() {
  const schedules = ref<Schedule[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSchedules(params?: QueryScheduleDto) {
    isLoading.value = true
    error.value = null
    try {
      const response = await scheduleApi.getList(params)
      schedules.value = response.data
    } catch {
      error.value = '加载日程失败'
    } finally {
      isLoading.value = false
    }
  }

  async function createSchedule(data: CreateScheduleDto) {
    const response = await scheduleApi.create(data)
    return response.data
  }

  async function updateSchedule(id: string, data: UpdateScheduleDto) {
    const response = await scheduleApi.update(id, data)
    return response.data
  }

  async function deleteSchedule(id: string) {
    await scheduleApi.remove(id)
  }

  return {
    schedules: computed(() => schedules.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
  }
}

export function useTodo() {
  const todos = ref<Todo[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTodos(params?: QueryTodoDto) {
    isLoading.value = true
    error.value = null
    try {
      const response = await todoApi.getList(params)
      todos.value = response.data
    } catch {
      error.value = '加载待办失败'
    } finally {
      isLoading.value = false
    }
  }

  async function createTodo(data: CreateTodoDto) {
    const response = await todoApi.create(data)
    return response.data
  }

  async function updateTodo(id: string, data: UpdateTodoDto) {
    const response = await todoApi.update(id, data)
    return response.data
  }

  async function deleteTodo(id: string) {
    await todoApi.remove(id)
  }

  async function toggleTodo(id: string, currentCompleted: boolean) {
    try {
      await todoApi.update(id, { isCompleted: !currentCompleted })
      await fetchTodos()
    } catch (err) {
      error.value = '更新待办状态失败'
      throw err
    }
  }

  return {
    todos: computed(() => todos.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchTodos,
    createTodo,
    updateTodo,
    deleteTodo,
    toggleTodo,
  }
}
