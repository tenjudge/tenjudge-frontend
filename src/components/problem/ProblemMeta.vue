<script setup lang="ts">
defineProps<{
  difficulty?: number
  tags?: string[]
  timeLimit?: number
  memoryLimit?: number
}>()
</script>

<template>
  <aside class="problem-meta" aria-label="Problem metadata">
    <dl class="problem-meta__list">
      <div v-if="difficulty !== undefined && difficulty !== null" class="problem-meta__item">
        <dt>Difficulty</dt>
        <dd>{{ difficulty }}</dd>
      </div>

      <div v-if="tags && tags.length > 0" class="problem-meta__item">
        <dt>Tags</dt>
        <dd>
          <span v-for="tag in tags" :key="tag" class="problem-meta__tag">{{ tag }}</span>
        </dd>
      </div>

      <div v-if="timeLimit !== undefined && timeLimit !== null" class="problem-meta__item">
        <dt>Time Limit</dt>
        <dd>{{ timeLimit }} ms</dd>
      </div>

      <div v-if="memoryLimit !== undefined && memoryLimit !== null" class="problem-meta__item">
        <dt>Memory Limit</dt>
        <dd>{{ memoryLimit }} MB</dd>
      </div>
    </dl>
  </aside>
</template>

<style scoped>
.problem-meta {
  display: grid;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.problem-meta__list {
  display: grid;
  gap: 10px;
  margin: 0;
}

.problem-meta__item {
  display: grid;
  gap: 2px;
}

.problem-meta__item dt {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.problem-meta__item dd {
  margin: 0;
  font-size: 14px;
  color: var(--color-text);
}

.problem-meta__tag {
  display: inline-block;
  padding: 2px 7px;
  margin: 2px 3px 2px 0;
  border-radius: 3px;
  background: #e8edf5;
  color: var(--color-text);
  font-size: 12px;
  line-height: 1.6;
}
</style>
