import { API_ENDPOINTS } from '@/api/endpoints'
import { http } from '@/api/client'
import type { JudgeRequest, SubmitJudgeResult } from '@/types/submission'

export function submitJudge(payload: JudgeRequest): Promise<SubmitJudgeResult> {
  return http.post(API_ENDPOINTS.submissions.judge, payload)
}

