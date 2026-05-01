import { computed, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getContestPage } from '@/api/contests'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_QUERY_KEYS } from '@/config/pagination'
import { CONTEST_STATUS, type ContestStatus } from '@/constants/contest'
import type { ContestListItem } from '@/types/contest'
import { getContestStatus } from '@/utils/contest'
import { toAppError } from '@/utils/error'

function parsePositiveInt(value: unknown, fallback: number): number {
  const candidate = Array.isArray(value) ? value[0] : value
  const parsed = Number(candidate)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function getContestDurationLabel(contest: ContestListItem) {
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

export interface ContestListRow extends ContestListItem {
  status: ContestStatus
  durationLabel: string
}

export function useContestList() {
  const route = useRoute()
  const router = useRouter()

  const contests = shallowRef<ContestListRow[]>([])
  const total = shallowRef(0)
  const pages = shallowRef(1)
  const loading = shallowRef(false)
  const errorMessage = shallowRef('')

  const currentPage = computed(() =>
    parsePositiveInt(route.query[PAGE_QUERY_KEYS.current], DEFAULT_PAGE),
  )

  const currentOrUpcomingContests = computed(() =>
    contests.value.filter((contest) => contest.status !== CONTEST_STATUS.ended),
  )

  const endedContests = computed(() =>
    contests.value.filter((contest) => contest.status === CONTEST_STATUS.ended),
  )

  const showInitialSkeleton = computed(
    () => loading.value && contests.value.length === 0 && !errorMessage.value,
  )

  watch(
    () => currentPage.value,
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

      contests.value = result.records.map((contest) => ({
        ...contest,
        status: getContestStatus(contest),
        durationLabel: getContestDurationLabel(contest),
      }))
      total.value = result.total
      pages.value = Math.max(result.pages || 1, 1)
    } catch (error) {
      errorMessage.value = toAppError(error, 'Unable to load contests.').message
    } finally {
      loading.value = false
    }
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

  function canRegister(contest: ContestListRow) {
    return contest.status !== CONTEST_STATUS.ended && !contest.registered
  }

  function canUnregister(contest: ContestListRow) {
    return contest.status === CONTEST_STATUS.upcoming && Boolean(contest.registered)
  }

  function getActionLabel(contest: ContestListRow) {
    if (canRegister(contest)) {
      return 'Register'
    }

    if (canUnregister(contest)) {
      return 'Unregister'
    }

    if (contest.registered && contest.status === CONTEST_STATUS.running) {
      return 'Registered'
    }

    if (contest.status === CONTEST_STATUS.ended) {
      return 'Closed'
    }

    return 'Registered'
  }

  return {
    contests,
    total,
    pages,
    loading,
    errorMessage,
    currentPage,
    currentOrUpcomingContests,
    endedContests,
    showInitialSkeleton,
    canRegister,
    canUnregister,
    getActionLabel,
    handlePageChange,
  }
}
