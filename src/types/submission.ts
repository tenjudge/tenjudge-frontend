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

export interface SubmissionListItem {
  submissionId: number
  problemName: string | null
  language: string
  status: string
  time: number | null
  memory: number | null
  submitTime: string
}

export interface TestCaseDetail {
  testCaseId: number
  status: string
  time: number
  memory: number
  info?: string
  input?: string
  output?: string
  answer?: string
}

export interface SubmissionDetail {
  id: number
  problemId: number
  problemName: string
  submitTime: string
  language: string
  status: string
  time: number
  memory: number
  info?: string
  code: string
  details: TestCaseDetail[]
}

