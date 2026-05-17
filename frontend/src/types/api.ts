export interface ApiResponse<T = unknown> {
  code: number
  data: T
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  code: number
  message: string
  data: null
}
