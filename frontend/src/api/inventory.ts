import http from './axios'
import type { ApiResponse } from '@/types/api'
import type { InventoryItem, CreateInventoryDto, UpdateInventoryDto, StockInOutDto, QueryInventoryDto } from '@/types/inventory'

export const inventoryApi = {
  getList(params?: QueryInventoryDto) {
    return http.get<ApiResponse<InventoryItem[]>>('/inventory', { params })
  },

  create(data: CreateInventoryDto) {
    return http.post<ApiResponse<InventoryItem>>('/inventory', data)
  },

  findOne(id: string) {
    return http.get<ApiResponse<InventoryItem>>(`/inventory/${id}`)
  },

  update(id: string, data: UpdateInventoryDto) {
    return http.patch<ApiResponse<InventoryItem>>(`/inventory/${id}`, data)
  },

  remove(id: string) {
    return http.delete<ApiResponse<void>>(`/inventory/${id}`)
  },

  stockIn(id: string, data: StockInOutDto) {
    return http.post<ApiResponse<InventoryItem>>(`/inventory/${id}/stock-in`, data)
  },

  stockOut(id: string, data: StockInOutDto) {
    return http.post<ApiResponse<InventoryItem>>(`/inventory/${id}/stock-out`, data)
  },
}
