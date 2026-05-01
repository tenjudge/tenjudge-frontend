<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

defineProps<{
  id: string
  label: string
  options: string[]
  placeholder?: string
}>()

const model = defineModel<string[]>({ required: true })

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)

function toggle() {
  open.value = !open.value
}

function close() {
  open.value = false
}

function isSelected(option: string): boolean {
  return model.value.includes(option)
}

function toggleOption(option: string) {
  if (isSelected(option)) {
    model.value = model.value.filter((item) => item !== option)
  } else {
    model.value = [...model.value, option]
  }
}

function removeTag(option: string) {
  model.value = model.value.filter((item) => item !== option)
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
</script>

<template>
  <div ref="rootRef" class="multiselect">
    <label class="field" :for="id">
      <span class="field__label">{{ label }}</span>
    </label>

    <div class="multiselect__trigger" @click="toggle" @keydown.escape="close">
      <div class="multiselect__tags">
        <span v-if="model.length === 0" class="multiselect__placeholder">
          {{ placeholder || 'Select options' }}
        </span>
        <span
          v-for="tag in model"
          :key="tag"
          class="multiselect__tag"
          @click.stop="removeTag(tag)"
        >
          {{ tag }}
          <span class="multiselect__tag-x">&times;</span>
        </span>
      </div>
      <span class="multiselect__arrow" :class="{ 'is-open': open }">
        <svg width="10" height="6" viewBox="0 0 10 6">
          <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" />
        </svg>
      </span>
    </div>

    <div v-if="open" class="multiselect__dropdown">
      <div
        v-for="option in options"
        :key="option"
        class="multiselect__option"
        @click="toggleOption(option)"
      >
        <span class="multiselect__checkbox" :class="{ 'is-checked': isSelected(option) }">
          <svg v-if="isSelected(option)" width="12" height="12" viewBox="0 0 12 12">
            <path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="2" fill="none" />
          </svg>
        </span>
        <span>{{ option }}</span>
      </div>
      <div v-if="options.length === 0" class="multiselect__empty">
        No options available
      </div>
    </div>
  </div>
</template>

<style scoped>
.multiselect {
  position: relative;
  display: grid;
  gap: 8px;
}

.field__label {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
}

.multiselect__trigger {
  display: flex;
  align-items: center;
  min-height: 42px;
  padding: 4px 32px 4px 8px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  position: relative;
  user-select: none;
}

.multiselect__trigger:focus-within {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.multiselect__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.multiselect__placeholder {
  color: #94a3b8;
  font-size: 14px;
  padding: 0 4px;
}

.multiselect__tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 6px;
  border-radius: 3px;
  background: #e8edf5;
  color: var(--color-text);
  font-size: 12px;
  line-height: 1.6;
  cursor: pointer;
}

.multiselect__tag-x {
  font-size: 14px;
  color: #64748b;
  line-height: 1;
}

.multiselect__tag:hover {
  background: #dce3ee;
}

.multiselect__arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  transition: transform 0.15s ease;
  display: flex;
  align-items: center;
}

.multiselect__arrow.is-open {
  transform: translateY(-50%) rotate(180deg);
}

.multiselect__dropdown {
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

.multiselect__option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
}

.multiselect__option:hover {
  background: #f1f5f9;
}

.multiselect__checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 1.5px solid var(--color-border-strong);
  border-radius: 3px;
  flex-shrink: 0;
  color: var(--color-surface);
}

.multiselect__checkbox.is-checked {
  background: var(--color-focus);
  border-color: var(--color-focus);
  color: var(--color-surface);
}

.multiselect__empty {
  padding: 12px;
  color: var(--color-text-muted);
  font-size: 13px;
  text-align: center;
}
</style>
