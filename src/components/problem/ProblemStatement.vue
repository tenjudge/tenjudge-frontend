<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { renderMarkdown } from '@/utils/markdown'

const props = defineProps<{
  statement: string
  solution?: string
  backTo?: string
  backLabel?: string
}>()

const router = useRouter()

const tabs = computed(() => {
  const items: { key: string; label: string }[] = [
    { key: 'problem', label: 'Statement' },
  ]
  if (props.solution) {
    items.push({ key: 'solution', label: 'Solution' })
  }
  return items
})

const activeTab = ref('problem')

const renderedHtml = computed(() => {
  const source = activeTab.value === 'solution' && props.solution
    ? props.solution
    : props.statement
  return renderMarkdown(source)
})
</script>

<template>
  <div class="problem-statement">
    <nav v-if="backTo || tabs.length > 1" class="statement-tabs">
      <button
        v-if="backTo"
        type="button"
        class="statement-tabs__back"
        :aria-label="backLabel || 'Back'"
        @click="router.push(backTo)"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8l5 5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ backLabel || 'Back' }}</span>
      </button>
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="statement-tabs__tab"
        :class="{ 'is-active': activeTab === tab.key }"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
      </button>
    </nav>

    <div class="statement-content" v-html="renderedHtml" />
  </div>
</template>

<style scoped>
.problem-statement {
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.statement-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-border);
}

.statement-tabs__back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
  margin-right: 8px;
  border: 0;
  border-right: 1px solid var(--color-border);
  background: none;
  color: var(--color-text-subtle);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease;
}

.statement-tabs__back:hover {
  color: var(--color-text);
}

.statement-tabs__tab {
  position: relative;
  padding: 10px 8px;
  border: 0;
  background: none;
  color: var(--color-text-subtle);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease;
}

.statement-tabs__tab:hover {
  color: var(--color-text);
}

.statement-tabs__tab.is-active {
  color: var(--color-text);
}

.statement-tabs__tab.is-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 8px;
  right: 8px;
  height: 2px;
  background: var(--color-focus);
  border-radius: 1px 1px 0 0;
}

.statement-content {
  padding: 24px 28px;
  color: var(--color-text);
  line-height: 1.7;
  word-wrap: break-word;
}

/* Markdown rendered content styles */
.statement-content :deep(h1),
.statement-content :deep(h2),
.statement-content :deep(h3) {
  margin-top: 1.2em;
  margin-bottom: 0.6em;
  line-height: 1.3;
}

.statement-content :deep(h1:first-child),
.statement-content :deep(h2:first-child),
.statement-content :deep(h3:first-child) {
  margin-top: 0;
}

.statement-content :deep(p) {
  margin: 0 0 0.8em;
}

.statement-content :deep(p:last-child) {
  margin-bottom: 0;
}

.statement-content :deep(code) {
  padding: 2px 6px;
  border-radius: 4px;
  background: var(--color-background-muted);
  font-size: 0.88em;
}

.statement-content :deep(pre) {
  padding: 14px 18px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background-muted);
  overflow-x: auto;
}

.statement-content :deep(.markdown-code-block pre) {
  padding: 3px var(--markdown-code-x) 8px;
  border: 0;
  border-radius: 0;
  background: #f7f7f8;
  line-height: 1.45;
}

.statement-content :deep(.markdown-code-block code) {
  font-size: 12px;
}

.statement-content :deep(pre code) {
  padding: 0;
  background: none;
}

.statement-content :deep(ul),
.statement-content :deep(ol) {
  padding-left: 1.5em;
  margin: 0 0 0.8em;
}

.statement-content :deep(li) {
  margin-bottom: 0.3em;
}

.statement-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 0.8em;
}

.statement-content :deep(th),
.statement-content :deep(td) {
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  text-align: left;
}

.statement-content :deep(th) {
  background: var(--color-background-muted);
  font-weight: 650;
}

.statement-content :deep(blockquote) {
  margin: 0 0 0.8em;
  padding: 4px 16px;
  border-left: 3px solid var(--color-border-strong);
  color: var(--color-text-muted);
}

.statement-content :deep(img) {
  max-width: 100%;
}
</style>
