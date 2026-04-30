export const CONTEST_STATUS = {
  upcoming: 'upcoming',
  running: 'running',
  ended: 'ended',
} as const

export const CONTEST_STATUS_LABELS = {
  [CONTEST_STATUS.upcoming]: 'Upcoming',
  [CONTEST_STATUS.running]: 'Running',
  [CONTEST_STATUS.ended]: 'Ended',
} as const

export type ContestStatus = (typeof CONTEST_STATUS)[keyof typeof CONTEST_STATUS]

