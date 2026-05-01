import { API_ENDPOINTS } from '@/api/endpoints'
import { http } from '@/api/client'
import type { JudgeRequest, SubmissionDetail, SubmissionListItem, SubmitJudgeResult } from '@/types/submission'
import type { PageQuery, PageResult } from '@/types/common'

export function submitJudge(payload: JudgeRequest): Promise<SubmitJudgeResult> {
  return http.post(API_ENDPOINTS.submissions.judge, payload)
}

export function getUserSubmissions(
  userId: number,
  query: PageQuery,
): Promise<PageResult<SubmissionListItem>> {
  return http.get(API_ENDPOINTS.submissions.userList(userId), { params: query })
}

export function getContestUserSubmissions(
  contestId: number,
  userId: number,
): Promise<SubmissionListItem[]> {
  return http.get(API_ENDPOINTS.submissions.contestUserList(contestId, userId))
}

export function getSubmissionDetail(submissionId: number): Promise<SubmissionDetail> {
  return http.get(API_ENDPOINTS.submissions.detail(submissionId))
}

