import axios, { AxiosError } from 'axios'

import { API_BASE_URL, API_SUCCESS_CODE } from '@/config/request'
import { useAuthStore } from '@/stores/auth'
import type { ApiResult, AppError } from '@/types/common'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
})

http.interceptors.request.use((config) => {
  const authStore = useAuthStore()

  if (authStore.tokenName && authStore.tokenValue) {
    config.headers.set(authStore.tokenName, authStore.tokenValue)
  }

  return config
})

http.interceptors.response.use(
  (response) => {
    const result = response.data as ApiResult<unknown>

    if (typeof result?.code === 'number') {
      if (result.code !== API_SUCCESS_CODE) {
        throw {
          code: result.code,
          message: result.message || 'Request failed.',
          raw: result,
        } satisfies AppError
      }

      return result.data
    }

    return response.data
  },
  (error: AxiosError<ApiResult<unknown>>) => {
    const result = error.response?.data

    if (result && typeof result.code === 'number') {
      return Promise.reject({
        code: result.code,
        message: result.message || 'Request failed.',
        raw: result,
      } satisfies AppError)
    }

    return Promise.reject({
      message: error.message || 'Network error. Please try again later.',
      raw: error,
    } satisfies AppError)
  },
)

