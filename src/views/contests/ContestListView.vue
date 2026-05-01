<script setup lang="ts">
import BasePagination from '@/components/base/BasePagination.vue'
import { useContestList } from '@/composables/useContestList'
import { CONTEST_STATUS_LABELS } from '@/constants/contest'
import { formatDateTime } from '@/utils/datetime'

const {
  contests,
  total,
  pages,
  errorMessage,
  currentPage,
  currentOrUpcomingContests,
  endedContests,
  showInitialSkeleton,
  canRegister,
  canUnregister,
  getActionLabel,
  handlePageChange,
} = useContestList()
</script>

<template>
  <section class="page" aria-labelledby="contests-title">
    <header class="page-header">
      <h1 id="contests-title" class="page-title">Contests</h1>
    </header>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <div v-if="!showInitialSkeleton && contests.length === 0" class="panel placeholder">
      <h2>No contests yet</h2>
      <p>No contest records were returned for the current page.</p>
    </div>

    <template v-else-if="showInitialSkeleton || contests.length > 0">
      <section class="contest-section" aria-labelledby="upcoming-title">
        <h2 id="upcoming-title" class="contest-section__title">Current or upcoming contests</h2>
        <div class="table-frame">
          <table class="contests-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Register</th>
              </tr>
            </thead>
            <tbody v-if="showInitialSkeleton">
              <tr v-for="row in [1, 2, 3, 4, 5, 6]" :key="`upcoming-skeleton-${row}`">
                <td><span class="skeleton-line skeleton-line--wide" /></td>
                <td><span class="skeleton-line" /></td>
                <td><span class="skeleton-line skeleton-line--short" /></td>
                <td><span class="skeleton-line skeleton-line--short" /></td>
              </tr>
            </tbody>
            <tbody v-else-if="currentOrUpcomingContests.length === 0">
              <tr>
                <td colspan="4" class="contests-table__empty">No current or upcoming contests.</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="contest in currentOrUpcomingContests" :key="contest.id">
                <td class="contests-table__name">
                  <RouterLink :to="`/contests/${contest.id}`">{{ contest.name }}</RouterLink>
                </td>
                <td>{{ formatDateTime(contest.startTime) }}</td>
                <td>{{ contest.durationLabel }}</td>
                <td>
                  <RouterLink
                    class="register-link"
                    :class="{
                      'is-register': canRegister(contest),
                      'is-unregister': canUnregister(contest),
                      'is-static': !canRegister(contest) && !canUnregister(contest),
                    }"
                    :to="`/contests/${contest.id}/register?name=${encodeURIComponent(contest.name)}&startTime=${encodeURIComponent(contest.startTime)}&endTime=${encodeURIComponent(contest.endTime)}&registered=${contest.registered || false}`"
                  >
                    {{ getActionLabel(contest) }}
                  </RouterLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="contest-section ended-section" aria-labelledby="ended-title">
        <h2 id="ended-title" class="contest-section__title">Ended contests</h2>
        <div class="table-frame">
          <table class="contests-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Start Time</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody v-if="showInitialSkeleton">
              <tr v-for="row in [1, 2, 3, 4, 5, 6]" :key="`ended-skeleton-${row}`">
                <td><span class="skeleton-line skeleton-line--wide" /></td>
                <td><span class="skeleton-line" /></td>
                <td><span class="skeleton-line skeleton-line--short" /></td>
                <td><span class="skeleton-line skeleton-line--short" /></td>
              </tr>
            </tbody>
            <tbody v-else-if="endedContests.length === 0">
              <tr>
                <td colspan="4" class="contests-table__empty">No ended contests on this page.</td>
              </tr>
            </tbody>
            <tbody v-else>
              <tr v-for="contest in endedContests" :key="contest.id">
                <td class="contests-table__name">
                  <RouterLink :to="`/contests/${contest.id}`">{{ contest.name }}</RouterLink>
                </td>
                <td>{{ formatDateTime(contest.startTime) }}</td>
                <td>{{ contest.durationLabel }}</td>
                <td>{{ CONTEST_STATUS_LABELS[contest.status] }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <div class="contests-pagination">
        <BasePagination
          :current="currentPage"
          :total="total"
          :pages="pages"
          :disabled="showInitialSkeleton"
          @update:current="handlePageChange"
        />
      </div>
    </template>
  </section>
</template>

<style scoped>
.contest-section {
  margin-top: 7px;
}

.ended-section {
  margin-top: 46px;
}

.contest-section__title {
  margin: 0 0 16px;
  color: var(--color-text);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.25;
}

.table-frame {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.table-frame {
  overflow-x: auto;
}

.contests-table {
  width: 100%;
  min-width: 820px;
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
}

.contests-table th:first-child,
.contests-table td:first-child {
  width: 41%;
  text-align: center;
}

.contests-table th:nth-child(2),
.contests-table td:nth-child(2) {
  width: 21%;
  text-align: center;
}

.contests-table th:nth-child(3),
.contests-table td:nth-child(3) {
  width: 20%;
  text-align: center;
}

.contests-table th:nth-child(4),
.contests-table td:nth-child(4) {
  width: 18%;
  text-align: center;
}

.contests-table__name a {
  color: var(--color-text);
  text-decoration: underline;
  text-underline-offset: 3px;
}

.contests-table__empty {
  padding: 18px 24px;
  color: var(--color-text-muted);
  text-align: center;
}

.skeleton-line {
  display: block;
  width: 72%;
  height: 12px;
  margin: 0 auto;
  border-radius: 999px;
  background: linear-gradient(90deg, #edf2f7 0%, #f7f9fb 50%, #edf2f7 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s linear infinite;
}

.skeleton-line--wide {
  width: 86%;
}

.skeleton-line--short {
  width: 44%;
}

.register-link {
  padding: 0;
  border: 0;
  border-radius: 0;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}

.register-link:disabled {
  cursor: default;
}

.register-link.is-register {
  color: #2563eb;
}

.register-link.is-unregister,
.register-link.is-static {
  color: #64748b;
}

.contests-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 900px) {
  .contest-section {
    margin-top: 28px;
  }
}
</style>
