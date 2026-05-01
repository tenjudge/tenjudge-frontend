<script setup lang="ts">
import type { SubmissionListItem } from '@/types/submission'
import { getSubmissionStatusLabel, SUBMISSION_STATUS_COLORS } from '@/constants/submission'
import { formatDateTime } from '@/utils/datetime'

const props = withDefaults(
  defineProps<{
    submissions: SubmissionListItem[]
    getProblemLink?: (item: SubmissionListItem) => string | null
  }>(),
  {},
)

function problemLink(item: SubmissionListItem): string | null {
  return props.getProblemLink?.(item) ?? null
}
</script>

<template>
  <div class="table-frame">
    <table class="submissions-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Problem</th>
          <th>Language</th>
          <th>Status</th>
          <th>Time</th>
          <th>Memory</th>
          <th>Submit Time</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in submissions" :key="item.submissionId">
          <td class="submissions-table__id">
            <RouterLink :to="`/submission/${item.submissionId}`">
              {{ item.submissionId }}
            </RouterLink>
          </td>
          <td class="submissions-table__problem">
            <template v-if="problemLink(item)">
              <RouterLink :to="problemLink(item)!">
                {{ item.problemName }}
              </RouterLink>
            </template>
            <template v-else>
              {{ item.problemName ?? '—' }}
            </template>
          </td>
          <td class="submissions-table__lang">
            {{ item.language }}
          </td>
          <td class="submissions-table__status">
            <RouterLink
              :to="`/submission/${item.submissionId}`"
              class="status-badge"
              :style="{ color: SUBMISSION_STATUS_COLORS[item.status] }"
            >
              {{ getSubmissionStatusLabel(item.status) }}
            </RouterLink>
          </td>
          <td class="submissions-table__metric">
            {{ item.time != null ? `${item.time}ms` : '—' }}
          </td>
          <td class="submissions-table__metric">
            {{ item.memory != null ? `${item.memory}MB` : '—' }}
          </td>
          <td class="submissions-table__time">
            {{ formatDateTime(item.submitTime) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-frame {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  overflow-x: auto;
}

.submissions-table {
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
}

.submissions-table th,
.submissions-table td {
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.submissions-table th:last-child,
.submissions-table td:last-child {
  border-right: 0;
}

.submissions-table tbody tr:last-child td {
  border-bottom: 0;
}

.submissions-table tbody tr:nth-child(even) {
  background: var(--color-background-muted);
}

.submissions-table tbody tr:nth-child(odd) {
  background: var(--color-surface);
}

.submissions-table th {
  height: 36px;
  background: #64748b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.submissions-table td {
  height: 39px;
  padding: 0 16px;
  color: var(--color-text);
  font-size: 14px;
}

.submissions-table th:nth-child(1),
.submissions-table td.submissions-table__id {
  width: 9%;
  text-align: center;
}

.submissions-table th:nth-child(2),
.submissions-table td.submissions-table__problem {
  width: 21%;
  text-align: center;
}

.submissions-table th:nth-child(3),
.submissions-table td.submissions-table__lang {
  width: 10%;
  text-align: center;
}

.submissions-table th:nth-child(4),
.submissions-table td.submissions-table__status {
  width: 18%;
  text-align: center;
}

.submissions-table th:nth-child(5),
.submissions-table td.submissions-table__metric {
  width: 10%;
  text-align: center;
}

.submissions-table th:nth-child(6),
.submissions-table td.submissions-table__metric {
  width: 10%;
  text-align: center;
}

.submissions-table th:nth-child(7),
.submissions-table td.submissions-table__time {
  width: 20%;
  text-align: center;
}

.submissions-table__id a {
  color: var(--color-text);
  font-weight: 650;
  text-decoration: none;
}

.submissions-table__id a:hover {
  text-decoration: underline;
}

.submissions-table__problem {
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.submissions-table__problem a {
  color: var(--color-text);
  font-weight: 650;
  text-decoration: none;
}

.submissions-table__problem a:hover {
  text-decoration: underline;
}

.submissions-table__lang {
  text-transform: uppercase;
  font-weight: 500;
  font-size: 13px;
}

.status-badge {
  font-weight: 650;
  font-size: 13px;
  text-decoration: none;
}

.status-badge:hover {
  text-decoration: underline;
}

.submissions-table__metric {
  font-weight: 500;
  font-size: 13px;
  color: var(--color-text-subtle);
}

.submissions-table__time {
  font-size: 12px;
  color: var(--color-text-subtle);
}
</style>
