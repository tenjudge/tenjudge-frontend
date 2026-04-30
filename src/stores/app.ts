import { defineStore } from 'pinia'

export type ToastType = 'success' | 'error'

export interface ToastMessage {
  id: number
  type: ToastType
  message: string
}

interface AppState {
  toasts: ToastMessage[]
}

let toastId = 0

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    toasts: [],
  }),

  actions: {
    showToast(type: ToastType, message: string) {
      const toast: ToastMessage = {
        id: ++toastId,
        type,
        message,
      }

      this.toasts.push(toast)
      window.setTimeout(() => this.dismissToast(toast.id), 4_000)
    },

    dismissToast(id: number) {
      this.toasts = this.toasts.filter((toast) => toast.id !== id)
    },
  },
})

