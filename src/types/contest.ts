export interface ContestListItem {
  id: number
  name: string
  startTime: string
  endTime: string
  freezeTime?: string
  ended?: boolean
  registered?: boolean
}

export interface ContestProblemBrief {
  id: number
  index: string
  title: string
}

export interface ContestDetail {
  id: number
  name: string
  startTime: string
  endTime: string
  freezeTime?: string
  penaltyPerWrong?: number
  problems: ContestProblemBrief[]
}

