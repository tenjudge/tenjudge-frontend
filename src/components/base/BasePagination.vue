<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    current: number
    total: number
    pages: number
    disabled?: boolean
  }>(),
  {
    disabled: false,
  },
)

const emit = defineEmits<{
  'update:current': [value: number]
}>()

const visiblePages = computed(() => {
  if (props.pages <= 1) {
    return [1]
  }

  const start = Math.max(1, props.current - 2)
  const end = Math.min(props.pages, start + 4)
  const normalizedStart = Math.max(1, end - 4)

  return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index)
})

function handlePageChange(page: number) {
  if (props.disabled || page === props.current || page < 1 || page > props.pages) {
    return
  }

  emit('update:current', page)
}
</script>

<template>
  <div class="pagination">
    <div class="pagination__controls">
      <button
        class="pagination__button"
        type="button"
        :disabled="disabled || current <= 1"
        @click="handlePageChange(current - 1)"
      >
        Previous
      </button>

      <button
        v-for="page in visiblePages"
        :key="page"
        class="pagination__button"
        :class="{ 'pagination__button--active': page === current }"
        type="button"
        :disabled="disabled"
        @click="handlePageChange(page)"
      >
        {{ page }}
      </button>

      <button
        class="pagination__button"
        type="button"
        :disabled="disabled || current >= pages"
        @click="handlePageChange(current + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px 18px;
}

.pagination__controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
}

.pagination__button {
  min-width: 28px;
  min-height: 28px;
  padding: 0 8px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #071228;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
}

.pagination__button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.pagination__button--active {
  background: #eef2f7;
  color: #071228;
  font-weight: 700;
}

.pagination__button:not(:disabled):hover {
  background: #f4f6fa;
}
</style>
