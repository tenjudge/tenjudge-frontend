<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    label: string
    rows?: number
    required?: boolean
    placeholder?: string
    disabled?: boolean
  }>(),
  {
    rows: 6,
    required: false,
    placeholder: '',
    disabled: false,
  },
)

const model = defineModel<string>({ required: true })
</script>

<template>
  <label class="field" :for="id">
    <span class="field__label">{{ label }}</span>
    <textarea
      :id="id"
      class="field__control"
      v-model="model"
      :rows="rows"
      :required="required"
      :placeholder="placeholder"
      :disabled="disabled"
    />
  </label>
</template>

<style scoped>
.field {
  display: grid;
  gap: 8px;
}

.field__label {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
}

.field__control {
  width: 100%;
  min-height: 42px;
  padding: 10px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
  font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
  font-size: 13px;
  line-height: 1.55;
  resize: vertical;
}

.field__control:focus {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.field__control:disabled {
  opacity: 0.64;
  cursor: not-allowed;
}
</style>
