import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute } from 'vue-router'

import { getContestDetail } from '@/api/contests'
import { getContestStatus } from '@/utils/contest'
import { toAppError } from '@/utils/error'
import type { ContestDetail } from '@/types/contest'
import type { ContestStatus } from '@/constants/contest'

export type ContestTab = 'problems' | 'submissions' | 'standings'

export function useContestDetail() {
  const route = useRoute()

  const contest = shallowRef<ContestDetail | null>(null)
  const status = shallowRef<ContestStatus | null>(null)
  const loading = shallowRef(false)
  const errorMessage = shallowRef('')
  const notStarted = shallowRef(false)
  const notStartedMessage = shallowRef('')

  const contestId = computed(() => Number(route.params.contestId))

  const activeTab = computed<ContestTab>(() => {
    const tab = route.query.tab
    if (tab === 'submissions' || tab === 'standings') return tab
    return 'problems'
  })

  watch(
    () => contestId.value,
    () => {
      void loadContestDetail()
    },
    { immediate: true },
  )

  async function loadContestDetail() {
    if (!contestId.value) return

    loading.value = true
    errorMessage.value = ''
    notStarted.value = false
    notStartedMessage.value = ''

    try {
      const result = await getContestDetail(contestId.value)
      contest.value = result
      status.value = getContestStatus({
        startTime: result.startTime,
        endTime: result.endTime,
        ended: status.value === 'ended' ? true : undefined,
      })
    } catch (error) {
      const appError = toAppError(error, 'Unable to load contest details.')
      errorMessage.value = appError.message

      if (
        appError.message.toLowerCase().includes('not started') ||
        appError.message.toLowerCase().includes('contest_not_started')
      ) {
        notStarted.value = true
        notStartedMessage.value = appError.message
      }
    } finally {
      loading.value = false
    }
  }

  return {
    contest,
    status,
    loading,
    errorMessage,
    notStarted,
    notStartedMessage,
    contestId,
    activeTab,
  }
}
