<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ContestTab } from '@/composables/useContestDetail'

defineProps<{
  activeTab: ContestTab
}>()

const router = useRouter()

interface TabDef {
  key: ContestTab
  label: string
}

const tabs: TabDef[] = [
  { key: 'problems', label: 'Problems' },
  { key: 'submissions', label: 'Submissions' },
  { key: 'standings', label: 'Standings' },
]

function selectTab(tab: ContestTab) {
  router.replace({ query: { tab: tab === 'problems' ? undefined : tab } })
}
</script>

<template>
  <nav class="subnav">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      class="subnav__tab"
      :class="{ 'is-active': activeTab === tab.key }"
      type="button"
      @click="selectTab(tab.key)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>

<style scoped>
.subnav {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--color-border);
}

.subnav__tab {
  position: relative;
  padding: 10px 20px;
  border: 0;
  background: none;
  color: var(--color-text-subtle);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.15s ease;
}

.subnav__tab:hover {
  color: var(--color-text);
}

.subnav__tab.is-active {
  color: var(--color-text);
}

.subnav__tab.is-active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 20px;
  right: 20px;
  height: 2px;
  background: var(--color-focus);
  border-radius: 1px 1px 0 0;
}
</style>
