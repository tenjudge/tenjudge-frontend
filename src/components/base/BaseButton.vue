<script setup lang="ts">
withDefaults(
  defineProps<{
    type?: 'button' | 'submit' | 'reset'
    variant?: 'primary' | 'secondary' | 'ghost'
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    type: 'button',
    variant: 'primary',
    disabled: false,
    loading: false,
  },
)
</script>

<template>
  <button
    class="base-button"
    :class="`base-button--${variant}`"
    :type="type"
    :disabled="disabled || loading"
  >
    <span v-if="loading" class="base-button__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-weight: 650;
  line-height: 1;
  cursor: pointer;
}

.base-button:disabled {
  cursor: not-allowed;
  opacity: 0.64;
}

.base-button--primary {
  background: var(--color-text);
  color: var(--color-surface);
}

.base-button--secondary {
  border-color: var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text);
}

.base-button--ghost {
  background: transparent;
  color: var(--color-text-muted);
}

.base-button__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 999px;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
