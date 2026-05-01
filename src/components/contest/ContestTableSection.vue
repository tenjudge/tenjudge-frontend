<script setup lang="ts">
import { RouterLink } from 'vue-router'

import type { ContestListRow } from '@/composables/useContestList'
import ContestStatusBadge from '@/components/contest/ContestStatusBadge.vue'
import { formatDateTime } from '@/utils/datetime'

defineProps<{
  title: string
  emptyMessage: string
  actionHeader: string
  rows: ContestListRow[]
  loading: boolean
  pendingContestId: number | null
  actionLabel: (contest: ContestListRow) => string
  canRegister: (contest: ContestListRow) => boolean
  canUnregister: (contest: ContestListRow) => boolean
}>()

const emit = defineEmits<{
  action: [contest: ContestListRow]
}>()

const skeletonRows = [1, 2, 3, 4, 5, 6]
</script>

<template>
  <section class="contest-section">
    <h2 class="contest-section__title">{{ title }}</h2>
    <div class="table-frame">
      <table class="contests-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Start Time</th>
            <th>Duration</th>
            <th>Status</th>
            <th>{{ actionHeader }}</th>
          </tr>
        </thead>
        <tbody v-if="loading">
          <tr v-for="row in skeletonRows" :key="`skeleton-${title}-${row}`">
            <td><span class="skeleton-line skeleton-line--wide" /></td>
            <td><span class="skeleton-line" /></td>
            <td><span class="skeleton-line skeleton-line--short" /></td>
            <td><span class="skeleton-line skeleton-line--short" /></td>
            <td><span class="skeleton-line skeleton-line--short" /></td>
          </tr>
        </tbody>
        <tbody v-else-if="rows.length === 0">
          <tr>
            <td colspan="5" class="contests-table__empty">{{ emptyMessage }}</td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr v-for="contest in rows" :key="contest.id">
            <td class="contests-table__name">
              <RouterLink :to="`/contests/${contest.id}`">{{ contest.name }}</RouterLink>
            </td>
            <td>{{ formatDateTime(contest.startTime) }}</td>
            <td>{{ contest.durationLabel }}</td>
            <td>
              <ContestStatusBadge :status="contest.status" />
            </td>
            <td>
              <button
                class="register-link"
                :class="{
                  'is-register': canRegister(contest),
                  'is-unregister': canUnregister(contest),
                  'is-static': !canRegister(contest) && !canUnregister(contest),
                }"
                type="button"
                :disabled="
                  pendingContestId === contest.id || (!canRegister(contest) && !canUnregister(contest))
                "
                @click="emit('action', contest)"
              >
                {{ pendingContestId === contest.id ? 'Working...' : actionLabel(contest) }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.contest-section {
  margin-top: 7px;
}

.contest-section__title {
  margin: 0 0 16px;
  color: var(--color-text);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
}

.table-frame {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.contests-table {
  width: 100%;
  min-width: 920px;
  border-collapse: collapse;
  table-layout: fixed;
}

.contests-table th,
.contests-table td {
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.contests-table th:last-child,
.contests-table td:last-child {
  border-right: 0;
}

.contests-table tbody tr:last-child td {
  border-bottom: 0;
}

.contests-table tbody tr:nth-child(even) {
  background: var(--color-background-muted);
}

.contests-table tbody tr:nth-child(odd) {
  background: var(--color-surface);
}

.contests-table th {
  height: 36px;
  background: #64748b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.contests-table td {
  height: 39px;
  padding: 0 24px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

.contests-table__name {
  text-align: left;
}

.contests-table__name a {
  color: var(--color-text);
  font-weight: 650;
  text-decoration: none;
}

.contests-table__name a:hover {
  text-decoration: underline;
}

.contests-table__empty {
  padding: 28px 16px;
  color: var(--color-text-muted);
}

.register-link {
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  cursor: pointer;
}

.register-link:disabled {
  cursor: default;
}

.register-link.is-register {
  color: var(--color-focus);
}

.register-link.is-unregister {
  color: var(--color-danger);
}

.register-link.is-static {
  color: var(--color-text-subtle);
}

.skeleton-line {
  display: inline-flex;
  width: 100%;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #e9eef5 0%, #dce5f1 50%, #e9eef5 100%);
}

.skeleton-line--wide {
  width: 72%;
}

.skeleton-line--short {
  width: 56%;
}
</style>
