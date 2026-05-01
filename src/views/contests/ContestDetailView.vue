<script setup lang="ts">
import ContestSubNav from '@/components/contest/ContestSubNav.vue'
import ContestInfoCard from '@/components/contest/ContestInfoCard.vue'
import { useContestDetail } from '@/composables/useContestDetail'
import { formatDateTime } from '@/utils/datetime'

const {
  contest,
  status,
  loading,
  errorMessage,
  notStarted,
  notStartedMessage,
  activeTab,
} = useContestDetail()

const placeholderTabs: Record<string, string> = {
  submissions: 'Submissions list will be available here.',
  standings: 'Contest standings will be available here.',
}
</script>

<template>
  <section class="page" aria-labelledby="contest-detail-title">
    <div v-if="errorMessage && !notStarted" class="form-error">{{ errorMessage }}</div>

    <template v-if="!errorMessage || notStarted">
      <header class="page-header">
        <h1 id="contest-detail-title" class="page-title">
          {{ contest?.name || 'Contest' }}
        </h1>
      </header>

      <ContestSubNav :activeTab="activeTab" />

      <div class="contest-layout">
        <div class="contest-layout__main">
          <div v-if="loading" class="contest-layout__loading">
            <div class="skeleton-block" v-for="i in [1, 2, 3, 4]" :key="i">
              <span class="skeleton-line skeleton-line--wide" />
            </div>
          </div>

          <template v-else-if="notStarted">
            <div class="panel placeholder">
              <h2>Contest has not started</h2>
              <p>{{ notStartedMessage }}</p>
            </div>
          </template>

          <template v-else-if="activeTab === 'problems'">
            <div v-if="!contest?.problems.length" class="panel placeholder">
              <h2>No problems</h2>
              <p>This contest has no problems yet.</p>
            </div>
            <div v-else class="table-frame">
              <table class="problems-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="problem in contest.problems"
                    :key="problem.id"
                  >
                    <td class="problems-table__index">{{ problem.index }}</td>
                    <td class="problems-table__title">
                      <RouterLink
                        :to="`/contests/${contest.id}/problems/${problem.index}`"
                      >
                        {{ problem.title }}
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>

          <div
            v-else
            class="panel placeholder"
          >
            <h2>{{ activeTab === 'submissions' ? 'Submissions' : 'Standings' }}</h2>
            <p>{{ placeholderTabs[activeTab] }}</p>
          </div>
        </div>

        <aside v-if="contest" class="contest-layout__aside">
          <ContestInfoCard :contest="contest" :status="status" />
        </aside>
      </div>
    </template>
  </section>
</template>

<style scoped>
.contest-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 28px;
  align-items: start;
  margin-top: 22px;
}

.contest-layout__loading {
  display: grid;
  gap: 12px;
}

.skeleton-block {
  padding: 12px 24px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.skeleton-line {
  display: block;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #edf2f7 0%, #f7f9fb 50%, #edf2f7 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s linear infinite;
}

.skeleton-line--wide {
  width: 86%;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* Table */

.table-frame {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.table-frame {
  overflow-x: auto;
}

.problems-table {
  width: 100%;
  min-width: 400px;
  border-collapse: collapse;
  table-layout: fixed;
}

.problems-table th,
.problems-table td {
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.problems-table th:last-child,
.problems-table td:last-child {
  border-right: 0;
}

.problems-table tbody tr:last-child td {
  border-bottom: 0;
}

.problems-table tbody tr:nth-child(even) {
  background: var(--color-background-muted);
}

.problems-table tbody tr:nth-child(odd) {
  background: var(--color-surface);
}

.problems-table th {
  height: 36px;
  background: #64748b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.problems-table td {
  height: 39px;
  padding: 0 24px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
}

.problems-table th:nth-child(1),
.problems-table td:nth-child(1) {
  width: 8%;
  text-align: center;
}

.problems-table th:nth-child(2),
.problems-table td:nth-child(2) {
  width: 92%;
  text-align: center;
}

.problems-table__index {
  text-align: center;
  font-weight: 650;
  color: var(--color-text-subtle);
}

.problems-table__title a {
  color: var(--color-text);
  font-weight: 650;
  text-decoration: none;
}

.problems-table__title a:hover {
  text-decoration: underline;
}

/* Responsive */

@media (max-width: 860px) {
  .contest-layout {
    grid-template-columns: 1fr;
  }

  .contest-layout__aside {
    order: -1;
  }
}
</style>
