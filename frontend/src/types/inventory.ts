export type InventoryCategory = 'fresh_food' | 'dry_food' | 'cleaning' | 'medicine' | 'personal_care' | 'tools' | 'other'

export interface InventoryItem {
  id: string
  name: string
  category: string
  quantity: number
  unit: string | null
  location: string | null
  expiryDate: string | null
  minQuantity: number
  note: string | null
  imageUrl: string | null
  familyId: string
  createdById: string
  createdBy: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateInventoryDto {
  name: string
  category: string
  quantity: number
  unit?: string
  location?: string
  expiryDate?: string
  minQuantity?: number
  note?: string
}

export interface UpdateInventoryDto extends Partial<CreateInventoryDto> {}

export interface StockInOutDto {
  quantity: number
  note?: string
}

export interface QueryInventoryDto {
  page?: number
  pageSize?: number
  search?: string
  category?: string
  location?: string
  expiring?: boolean
  lowStock?: boolean
}
