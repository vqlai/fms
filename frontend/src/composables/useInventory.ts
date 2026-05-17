import { ref, computed } from 'vue'
import { inventoryApi } from '@/api/inventory'
import type { InventoryItem, CreateInventoryDto, UpdateInventoryDto, StockInOutDto, QueryInventoryDto } from '@/types/inventory'

export function useInventory() {
  const items = ref<InventoryItem[]>([])
  const currentItem = ref<InventoryItem | null>(null)
  const pagination = ref({ page: 1, pageSize: 20, total: 0, totalPages: 0 })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchItems(params?: QueryInventoryDto) {
    isLoading.value = true
    error.value = null
    try {
      const response = await inventoryApi.getList(params)
      items.value = response.data
      if ('pagination' in response) {
        pagination.value = (response as Record<string, unknown>).pagination as typeof pagination.value
      }
    } catch {
      error.value = '加载库存物品失败'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchItem(id: string) {
    isLoading.value = true
    error.value = null
    try {
      const response = await inventoryApi.findOne(id)
      currentItem.value = response.data
    } catch {
      error.value = '加载物品详情失败'
    } finally {
      isLoading.value = false
    }
  }

  async function createItem(data: CreateInventoryDto) {
    const response = await inventoryApi.create(data)
    return response.data
  }

  async function updateItem(id: string, data: UpdateInventoryDto) {
    const response = await inventoryApi.update(id, data)
    return response.data
  }

  async function deleteItem(id: string) {
    await inventoryApi.remove(id)
  }

  async function stockIn(id: string, data: StockInOutDto) {
    const response = await inventoryApi.stockIn(id, data)
    return response.data
  }

  async function stockOut(id: string, data: StockInOutDto) {
    const response = await inventoryApi.stockOut(id, data)
    return response.data
  }

  return {
    items: computed(() => items.value),
    currentItem: computed(() => currentItem.value),
    pagination: computed(() => pagination.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    fetchItems,
    fetchItem,
    createItem,
    updateItem,
    deleteItem,
    stockIn,
    stockOut,
  }
}
