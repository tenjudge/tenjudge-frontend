<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useAppStore } from '@/stores/app'

const appStore = useAppStore()
const { toasts } = storeToRefs(appStore)
</script>

<template>
  <div class="toast-region" aria-live="polite" aria-atomic="true">
    <button
      v-for="toast in toasts"
      :key="toast.id"
      class="toast"
      :class="`toast--${toast.type}`"
      type="button"
      @click="appStore.dismissToast(toast.id)"
    >
      <span class="toast__title">{{ toast.type === 'success' ? 'Success' : 'Error' }}</span>
      <span class="toast__message">{{ toast.message }}</span>
    </button>
  </div>
</template>

<style scoped>
.toast-region {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 50;
  display: grid;
  gap: 10px;
  width: min(360px, calc(100vw - 32px));
}

.toast {
  display: grid;
  gap: 4px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--color-border-strong);
  border-left-width: 4px;
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-popover);
  color: var(--color-text);
  text-align: left;
  cursor: pointer;
}

.toast--success {
  border-left-color: var(--color-success);
}

.toast--error {
  border-left-color: var(--color-danger);
}

.toast__title {
  font-size: 13px;
  font-weight: 700;
}

.toast__message {
  color: var(--color-text-muted);
  font-size: 13px;
  line-height: 1.45;
}
</style>

