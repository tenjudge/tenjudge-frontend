import { useAppStore } from '@/stores/app'

export function useToast() {
  const appStore = useAppStore()

  return {
    success: (message: string) => appStore.showToast('success', message),
    error: (message: string) => appStore.showToast('error', message),
  }
}

