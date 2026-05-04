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

export interface CreateContestRequest {
  name: string
  startTime: string
  endTime: string
  freezeTime?: string
  penaltyPerWrong?: number
}

export interface CreateContestResult {
  id: number
}

export interface ContestProblemInput {
  problemId: number
  problemIndex: string
}

export interface UpdateContestRequest extends CreateContestRequest {
  contestId: number
  contestProblems?: ContestProblemInput[]
}

export interface ContestBoardProblem {
  problemId: number
  problemIndex: string
}

export interface ContestProblemResult {
  accepted: boolean
  acceptedAt: number
  wrongAttemptsBeforeAc: number
}

export interface ContestBoardListItem {
  rank: number
  userId: number
  username: string
  solvedCount: number
  penalty: number
  problemResults?: Record<string, ContestProblemResult | undefined>
}

export interface ContestBoardPage {
  problems: ContestBoardProblem[]
  records: ContestBoardListItem[]
  total: number
  current: number
  size: number
  pages: number
}
