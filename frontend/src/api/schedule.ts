import http from './axios'
import type { ApiResponse } from '@/types/api'
import type { Schedule, CreateScheduleDto, UpdateScheduleDto, QueryScheduleDto, Todo, CreateTodoDto, UpdateTodoDto, QueryTodoDto } from '@/types/schedule'

export const scheduleApi = {
  getList(params?: QueryScheduleDto) {
    return http.get<ApiResponse<Schedule[]>>('/schedules', { params })
  },

  create(data: CreateScheduleDto) {
    return http.post<ApiResponse<Schedule>>('/schedules', data)
  },

  findOne(id: string) {
    return http.get<ApiResponse<Schedule>>(`/schedules/${id}`)
  },

  update(id: string, data: UpdateScheduleDto) {
    return http.patch<ApiResponse<Schedule>>(`/schedules/${id}`, data)
  },

  remove(id: string) {
    return http.delete<ApiResponse<void>>(`/schedules/${id}`)
  },
}

export const todoApi = {
  getList(params?: QueryTodoDto) {
    return http.get<ApiResponse<Todo[]>>('/todos', { params })
  },

  create(data: CreateTodoDto) {
    return http.post<ApiResponse<Todo>>('/todos', data)
  },

  findOne(id: string) {
    return http.get<ApiResponse<Todo>>(`/todos/${id}`)
  },

  update(id: string, data: UpdateTodoDto) {
    return http.patch<ApiResponse<Todo>>(`/todos/${id}`, data)
  },

  remove(id: string) {
    return http.delete<ApiResponse<void>>(`/todos/${id}`)
  },
}
