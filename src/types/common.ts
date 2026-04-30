export interface ApiResult<T> {
  code: number
  message: string
  data: T
}

export interface PageQuery {
  current: number
  size: number
}

export interface PageResult<T> {
  records: T[]
  total: number
  current: number
  size: number
  pages: number
}

export interface AppError {
  code?: number
  message: string
  raw?: unknown
}

