import { ref } from 'vue'

import { toAppError } from '@/utils/error'
import type { AppError } from '@/types/common'

export function useAsyncState() {
  const loading = ref(false)
  const error = ref<AppError | null>(null)

  async function run<T>(task: () => Promise<T>, fallbackMessage?: string): Promise<T | null> {
    loading.value = true
    error.value = null

    try {
      return await task()
    } catch (caught) {
      error.value = toAppError(caught, fallbackMessage)
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    run,
  }
}
