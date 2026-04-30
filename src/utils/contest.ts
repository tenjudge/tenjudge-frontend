import { CONTEST_STATUS, type ContestStatus } from '@/constants/contest'
import type { ContestListItem } from '@/types/contest'

export function getContestStatus(contest: Pick<ContestListItem, 'ended' | 'startTime' | 'endTime'>): ContestStatus {
  // Backend also returns `ended`; prefer it when true because it represents server-side contest state.
  if (contest.ended) {
    return CONTEST_STATUS.ended
  }

  const now = Date.now()
  const start = new Date(contest.startTime).getTime()
  const end = new Date(contest.endTime).getTime()

  if (!Number.isNaN(end) && now > end) {
    return CONTEST_STATUS.ended
  }

  if (!Number.isNaN(start) && now < start) {
    return CONTEST_STATUS.upcoming
  }

  return CONTEST_STATUS.running
}

