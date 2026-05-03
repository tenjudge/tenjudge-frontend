<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'

import BasePagination from '@/components/base/BasePagination.vue'
import ContestInfoCard from '@/components/contest/ContestInfoCard.vue'
import ContestSubNav from '@/components/contest/ContestSubNav.vue'
import ContestStandingsTable from '@/components/contest/ContestStandingsTable.vue'
import SubmissionTable from '@/components/submission/SubmissionTable.vue'
import { useContestDetail } from '@/composables/useContestDetail'
import { useAuthStore } from '@/stores/auth'
import { getContestBoardPage } from '@/api/contests'
import { DEFAULT_PAGE_SIZE } from '@/config/pagination'
import { getContestUserSubmissions } from '@/api/submissions'
import type { ContestBoardPage } from '@/types/contest'
import type { SubmissionListItem } from '@/types/submission'
import { toAppError } from '@/utils/error'
import { useSubmissionPolling } from '@/composables/useSubmissionPolling'

const {
  contest,
  status,
  loading,
  errorMessage,
  notStarted,
  notStartedMessage,
  contestId,
  activeTab,
} = useContestDetail()

const authStore = useAuthStore()
const route = useRoute()

const contestSubmissions = shallowRef<SubmissionListItem[]>([])
const submissionsLoading = ref(false)
const submissionsError = ref('')

const contestBoard = shallowRef<ContestBoardPage | null>(null)
const standingsLoading = ref(false)
const standingsError = ref('')
const standingsCurrentPage = ref(1)
// Delay skeleton to avoid flicker on fast responses (e.g. empty list)
const showSkeleton = ref(false)
let skeletonTimer: ReturnType<typeof setTimeout> | null = null

const polling = useSubmissionPolling()

const submissionQueryUserId = computed(() => {
  const raw = route.query.userId
  const value = Array.isArray(raw) ? raw[0] : raw
  if (!value) return null

  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
})

const selectedSubmissionUserId = computed(() => {
  return submissionQueryUserId.value ?? authStore.userInfo?.id ?? null
})

const selectedSubmissionUsername = computed(() => {
  const raw = route.query.username
  const value = Array.isArray(raw) ? raw[0] : raw
  return typeof value === 'string' && value.trim() ? value.trim() : ''
})

const isViewingOwnSubmissions = computed(() => {
  const ownUserId = authStore.userInfo?.id
  return Boolean(ownUserId && selectedSubmissionUserId.value === ownUserId)
})

const canViewContestSubmissions = computed(() => {
  return Boolean(selectedSubmissionUserId.value)
})

const contestSubmissionsTitle = computed(() => {
  if (!selectedSubmissionUserId.value) return 'My submissions'
  if (isViewingOwnSubmissions.value) return 'My submissions'
  if (selectedSubmissionUsername.value) return `${selectedSubmissionUsername.value}'s submissions`
  return `User #${selectedSubmissionUserId.value} submissions`
})

const contestSubmissionsEmptyMessage = computed(() => {
  if (isViewingOwnSubmissions.value || !submissionQueryUserId.value) {
    return 'You have no submissions in this contest yet.'
  }

  if (selectedSubmissionUsername.value) {
    return `${selectedSubmissionUsername.value} has no submissions in this contest yet.`
  }

  return 'This user has no submissions in this contest yet.'
})

function hasContestPending() {
  return contestSubmissions.value.some((s) => s.status === 'PENDING')
}

async function silentRefreshContestSubmissions() {
  const userId = selectedSubmissionUserId.value
  const contestId = contest.value?.id
  if (!userId || !contestId) return

  try {
    contestSubmissions.value = await getContestUserSubmissions(contestId, userId)
  } catch {
    // Polling failures are silently ignored
  }
}

watch(
  [activeTab, () => contest.value?.id, selectedSubmissionUserId],
  ([tab, cid, userId]) => {
    if (tab === 'submissions' && cid && userId) {
      void loadContestSubmissions()
    }
  },
  { immediate: true },
)

watch(
  [activeTab, () => contest.value?.id, standingsCurrentPage],
  ([tab, cid]) => {
    if (tab === 'standings' && cid) {
      void loadContestStandings()
    }
  },
  { immediate: true },
)

async function loadContestSubmissions() {
  polling.stop()

  const userId = selectedSubmissionUserId.value
  const contestId = contest.value?.id
  if (!userId || !contestId) return

  contestSubmissions.value = []
  submissionsLoading.value = true
  submissionsError.value = ''
  // Only show skeleton if the request takes longer than 300ms
  skeletonTimer = setTimeout(() => {
    showSkeleton.value = true
  }, 300)

  try {
    contestSubmissions.value = await getContestUserSubmissions(contestId, userId)

    if (hasContestPending()) {
      polling.start(silentRefreshContestSubmissions, hasContestPending)
    }
  } catch (error) {
    submissionsError.value = toAppError(error, 'Unable to load submissions.').message
  } finally {
    if (skeletonTimer) {
      clearTimeout(skeletonTimer)
      skeletonTimer = null
    }
    showSkeleton.value = false
    submissionsLoading.value = false
  }
}

async function loadContestStandings() {
  const contestId = contest.value?.id
  if (!contestId) return

  standingsLoading.value = true
  standingsError.value = ''

  try {
    contestBoard.value = await getContestBoardPage(contestId, {
      current: standingsCurrentPage.value,
      size: DEFAULT_PAGE_SIZE,
    })
  } catch (error) {
    standingsError.value = toAppError(error, 'Unable to load standings.').message
  } finally {
    standingsLoading.value = false
  }
}

function handleStandingsPageChange(page: number) {
  standingsCurrentPage.value = page
}

const loadingRows = Array.from({ length: 5 }, (_, i) => i)
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

      <div
        class="contest-layout"
        :class="{ 'contest-layout--single': activeTab !== 'problems' }"
      >
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

          <template v-else-if="activeTab === 'submissions'">
            <div v-if="!canViewContestSubmissions" class="panel placeholder">
              <h2>Sign in required</h2>
              <p>
                <RouterLink to="/auth/login">Sign in</RouterLink>
                to view your submissions in this contest.
              </p>
            </div>

            <div v-else-if="submissionsError" class="form-error">
              {{ submissionsError }}
            </div>

            <template v-else>
              <div v-if="!isViewingOwnSubmissions" class="contest-submissions-header">
                <h2 class="contest-submissions-header__title">
                  {{ contestSubmissionsTitle }}
                </h2>
                <RouterLink
                  v-if="authStore.isAuthenticated && !isViewingOwnSubmissions"
                  class="contest-submissions-header__button"
                  :to="{
                    path: `/contests/${contestId}`,
                    query: { tab: 'submissions' },
                  }"
                >
                  My submissions
                </RouterLink>
              </div>

              <div v-if="showSkeleton && submissionsLoading && contestSubmissions.length === 0">
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
                      <tr v-for="i in loadingRows" :key="i">
                        <td v-for="j in 7" :key="j" class="skeleton-cell">
                          <span class="skeleton-line" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div v-else-if="contestSubmissions.length === 0" class="panel placeholder">
                <h2>No submissions</h2>
                <p>{{ contestSubmissionsEmptyMessage }}</p>
              </div>

              <SubmissionTable
                v-else
                :submissions="contestSubmissions"
                :get-problem-link="(item) => {
                  const m = item.problemName?.match(/^([A-Z]+)\./)
                  return m ? `/contests/${contest!.id}/problems/${m[1]}` : null
                }"
              />
            </template>
          </template>

          <template v-else>
            <div v-if="standingsError" class="form-error">
              {{ standingsError }}
            </div>

            <div v-else-if="standingsLoading && !contestBoard" class="contest-layout__loading">
              <div class="skeleton-block" v-for="i in [1, 2, 3, 4]" :key="i">
                <span class="skeleton-line skeleton-line--wide" />
              </div>
            </div>

            <div v-else-if="!contestBoard || contestBoard.records.length === 0" class="panel placeholder">
              <h2>No standings</h2>
              <p>No ranking records were returned for this contest.</p>
            </div>

            <template v-else>
              <ContestStandingsTable
                :contest-id="contestId"
                :problems="contestBoard.problems"
                :rows="contestBoard.records"
              />

              <div v-if="contestBoard.pages > 1" class="pagination-wrapper">
                <BasePagination
                  :current="contestBoard.current"
                  :total="contestBoard.total"
                  :pages="contestBoard.pages"
                  :disabled="standingsLoading"
                  @update:current="handleStandingsPageChange"
                />
              </div>
            </template>
          </template>
        </div>

        <aside v-if="contest && activeTab === 'problems'" class="contest-layout__aside">
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

.contest-layout--single {
  grid-template-columns: 1fr;
}

.contest-layout__loading {
  display: grid;
  gap: 12px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.contest-submissions-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 12px;
}

.contest-submissions-header__title {
  margin: 0;
  color: var(--color-text);
  font-size: 16px;
  font-weight: 700;
}

.contest-submissions-header__button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid var(--color-border-strong);
  border-radius: 4px;
  background: var(--color-background-muted);
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 650;
  text-decoration: none;
  white-space: nowrap;
}

.contest-submissions-header__button:hover {
  background: color-mix(in srgb, var(--color-border-strong) 36%, var(--color-surface));
  color: var(--color-text);
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

/* Submissions tab */

.submissions-table {
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
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
  vertical-align: middle;
}

.skeleton-cell {
  border-bottom: 1px solid var(--color-border);
}

.skeleton-cell .skeleton-line {
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #edf2f7 0%, #f7f9fb 50%, #edf2f7 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s linear infinite;
  display: block;
  max-width: 70%;
  margin: 0 auto;
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
