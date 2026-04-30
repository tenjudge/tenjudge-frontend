<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { getContestPage, registerContest, unregisterContest } from '@/api/contests'
import BasePagination from '@/components/base/BasePagination.vue'
import { useToast } from '@/composables/useToast'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_QUERY_KEYS } from '@/config/pagination'
import { CONTEST_STATUS } from '@/constants/contest'
import { useAuthStore } from '@/stores/auth'
import type { ContestListItem } from '@/types/contest'
import { getContestStatus } from '@/utils/contest'
import { formatDateTime } from '@/utils/datetime'
import { toAppError } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const contests = ref<ContestListItem[]>([])
const total = ref(0)
const pages = ref(1)
const loading = ref(false)
const errorMessage = ref('')
const pendingContestId = ref<number | null>(null)
const skeletonRows = [1, 2, 3, 4, 5, 6]

const currentPage = computed(() => parsePositiveInt(route.query[PAGE_QUERY_KEYS.current], DEFAULT_PAGE))
const currentOrUpcomingContests = computed(() =>
  contests.value.filter((contest) => getContestStatus(contest) !== CONTEST_STATUS.ended),
)
const endedContests = computed(() =>
  contests.value.filter((contest) => getContestStatus(contest) === CONTEST_STATUS.ended),
)
const showInitialSkeleton = computed(
  () => loading.value && contests.value.length === 0 && !errorMessage.value,
)

watch(
  () => [currentPage.value, authStore.isAuthenticated],
  () => {
    void loadContests()
  },
  { immediate: true },
)

async function loadContests() {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getContestPage({
      current: currentPage.value,
      size: DEFAULT_PAGE_SIZE,
    })

    contests.value = result.records
    total.value = result.total
    pages.value = Math.max(result.pages || 1, 1)
  } catch (error) {
    errorMessage.value = toAppError(error, 'Unable to load contests.').message
  } finally {
    loading.value = false
  }
}

function parsePositiveInt(value: unknown, fallback: number): number {
  const candidate = Array.isArray(value) ? value[0] : value
  const parsed = Number(candidate)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

async function updateRouteQuery(nextCurrent: number) {
  await router.replace({
    query: {
      ...route.query,
      [PAGE_QUERY_KEYS.current]: String(nextCurrent),
    },
  })
}

async function handlePageChange(page: number) {
  await updateRouteQuery(page)
}

function canRegister(contest: ContestListItem) {
  return getContestStatus(contest) !== CONTEST_STATUS.ended && !contest.registered
}

function canUnregister(contest: ContestListItem) {
  return getContestStatus(contest) === CONTEST_STATUS.upcoming && Boolean(contest.registered)
}

function getActionLabel(contest: ContestListItem) {
  const status = getContestStatus(contest)

  if (canRegister(contest)) {
    return 'Register'
  }

  if (canUnregister(contest)) {
    return 'Unregister'
  }

  if (contest.registered && status === CONTEST_STATUS.running) {
    return 'Registered'
  }

  if (status === CONTEST_STATUS.ended) {
    return 'Closed'
  }

  return 'Registered'
}

function formatDuration(contest: ContestListItem) {
  const start = new Date(contest.startTime).getTime()
  const end = new Date(contest.endTime).getTime()

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return '-'
  }

  const totalMinutes = Math.round((end - start) / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  }

  if (hours > 0) {
    return `${hours}h`
  }

  return `${minutes}m`
}

async function handleRegistration(contest: ContestListItem) {
  if (!authStore.isAuthenticated) {
    toast.error('Please log in to manage contest registration.')
    await router.push({
      path: '/auth/login',
      query: { redirect: route.fullPath },
    })
    return
  }

  pendingContestId.value = contest.id

  try {
    if (canRegister(contest)) {
      await registerContest(contest.id)
      contest.registered = true
      toast.success('Contest registration submitted.')
      return
    }

    // Backend only allows cancellation before the contest starts, so the UI hides the
    // action for running and ended contests and only calls unregister in the upcoming state.
    if (canUnregister(contest)) {
      await unregisterContest(contest.id)
      contest.registered = false
      toast.success('Contest registration cancelled.')
    }
  } catch (error) {
    toast.error(toAppError(error).message)
  } finally {
    pendingContestId.value = null
  }
}
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
            <tbody>
              <tr v-if="showInitialSkeleton" v-for="row in skeletonRows" :key="`upcoming-skeleton-${row}`">
                <td><span class="skeleton-line skeleton-line--wide" /></td>
                <td><span class="skeleton-line" /></td>
                <td><span class="skeleton-line skeleton-line--short" /></td>
                <td><span class="skeleton-line skeleton-line--short" /></td>
              </tr>
              <tr v-else-if="currentOrUpcomingContests.length === 0">
                <td colspan="4" class="contests-table__empty">No current or upcoming contests.</td>
              </tr>
              <tr v-for="contest in currentOrUpcomingContests" :key="contest.id">
                <td class="contests-table__name">
                  <RouterLink :to="`/contests/${contest.id}`">{{ contest.name }}</RouterLink>
                </td>
                <td>{{ formatDateTime(contest.startTime) }}</td>
                <td>{{ formatDuration(contest) }}</td>
                <td>
                  <button
                    class="register-link"
                    :class="{
                      'is-register': canRegister(contest),
                      'is-unregister': canUnregister(contest),
                      'is-static': !canRegister(contest) && !canUnregister(contest),
                    }"
                    type="button"
                    :disabled="pendingContestId === contest.id || (!canRegister(contest) && !canUnregister(contest))"
                    @click="handleRegistration(contest)"
                  >
                    {{ pendingContestId === contest.id ? 'Working...' : getActionLabel(contest) }}
                  </button>
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
            <tbody>
              <tr v-if="showInitialSkeleton" v-for="row in skeletonRows" :key="`ended-skeleton-${row}`">
                <td><span class="skeleton-line skeleton-line--wide" /></td>
                <td><span class="skeleton-line" /></td>
                <td><span class="skeleton-line skeleton-line--short" /></td>
                <td><span class="skeleton-line skeleton-line--short" /></td>
              </tr>
              <tr v-else-if="endedContests.length === 0">
                <td colspan="4" class="contests-table__empty">No ended contests on this page.</td>
              </tr>
              <tr v-for="contest in endedContests" :key="contest.id">
                <td class="contests-table__name">
                  <RouterLink :to="`/contests/${contest.id}`">{{ contest.name }}</RouterLink>
                </td>
                <td>{{ formatDateTime(contest.startTime) }}</td>
                <td>{{ formatDuration(contest) }}</td>
                <td>{{ getActionLabel(contest) }}</td>
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
          :disabled="loading || showInitialSkeleton"
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
  margin-top: 28px;
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
