<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

export interface SelectOption {
  value: string
  label: string
}

defineProps<{
  id: string
  label: string
  options: readonly SelectOption[]
  placeholder?: string
}>()

const model = defineModel<string>({ required: true })

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function select(option: SelectOption) {
  model.value = option.value
  close()
}

function close() {
  open.value = false
}

function onDocumentClick(event: MouseEvent) {
  if (!open.value) return
  if (rootRef.value && !rootRef.value.contains(event.target as Node)) {
    close()
  }
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick, true)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick, true)
})

function selectedLabel(): string {
  const found = options.find((o) => o.value === model.value)
  return found ? found.label : ''
}
</script>

<template>
  <div ref="rootRef" class="select">
    <label class="field" :for="id">
      <span class="field__label">{{ label }}</span>
    </label>

    <div
      class="select__trigger"
      @click="open = !open"
      @keydown.escape="close"
    >
      <span v-if="!model.value" class="select__placeholder">
        {{ placeholder || 'Select an option' }}
      </span>
      <span v-else class="select__value">{{ selectedLabel() }}</span>
      <span class="select__arrow" :class="{ 'is-open': open }">
        <svg width="10" height="6" viewBox="0 0 10 6">
          <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" />
        </svg>
      </span>
    </div>

    <div v-if="open" class="select__dropdown">
      <div
        v-for="option in options"
        :key="option.value"
        class="select__option"
        :class="{ 'is-selected': model.value === option.value }"
        @click="select(option)"
      >
        {{ option.label }}
      </div>
      <div v-if="options.length === 0" class="select__empty">
        No options available
      </div>
    </div>
  </div>
</template>

<style scoped>
.select {
  position: relative;
  display: grid;
  gap: 8px;
}

.field__label {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
}

.select__trigger {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 0 32px 0 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  position: relative;
  user-select: none;
}

.select__trigger:focus-within {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.select__placeholder {
  color: #94a3b8;
  font-size: 14px;
}

.select__value {
  color: var(--color-text);
  font-size: 14px;
}

.select__arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  transition: transform 0.15s ease;
  display: flex;
  align-items: center;
}

.select__arrow.is-open {
  transform: translateY(-50%) rotate(180deg);
}

.select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 220px;
  overflow-y: auto;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-top: 4px;
}

.select__option {
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
}

.select__option:hover {
  background: #f1f5f9;
}

.select__option.is-selected {
  background: #e8edf5;
  font-weight: 650;
}

.select__empty {
  padding: 12px;
  color: var(--color-text-muted);
  font-size: 13px;
  text-align: center;
}
</style>
