import type { SubmitLanguage } from '@/constants/languages'

export interface JudgeRequest {
  problemId: number
  contestId?: number
  language: SubmitLanguage
  code: string
  isAgent: boolean
}

export interface SubmitJudgeResult {
  submissionId: number
}

