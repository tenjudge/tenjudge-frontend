<script setup lang="ts">
withDefaults(
  defineProps<{
    id: string
    label: string
    type?: string
    autocomplete?: string
    required?: boolean
    placeholder?: string
  }>(),
  {
    type: 'text',
    autocomplete: undefined,
    required: false,
    placeholder: '',
  },
)

const model = defineModel<string>({ required: true })
</script>

<template>
  <label class="field" :for="id">
    <span class="field__label">{{ label }}</span>
    <input
      :id="id"
      class="field__control"
      v-model="model"
      :type="type"
      :autocomplete="autocomplete"
      :required="required"
      :placeholder="placeholder"
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
  padding: 0 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
}

.field__control:focus {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}
</style>
