import type { AppError } from '@/types/common'

export function toAppError(error: unknown, fallbackMessage = 'Something went wrong.'): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error && error.message) {
    return { message: error.message, raw: error }
  }

  return { message: fallbackMessage, raw: error }
}

export function isAppError(error: unknown): error is AppError {
  return typeof error === 'object' && error !== null && 'message' in error
}

