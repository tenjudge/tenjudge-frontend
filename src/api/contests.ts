import { API_ENDPOINTS } from '@/api/endpoints'
import { http } from '@/api/client'
import type { PageQuery, PageResult } from '@/types/common'
import type { ContestBoardPage, ContestDetail, ContestListItem } from '@/types/contest'
import type { ProblemDetail } from '@/types/problem'

export function getContestPage(query: PageQuery): Promise<PageResult<ContestListItem>> {
  return http.get(API_ENDPOINTS.contests.list, { params: query })
}

export function getContestDetail(contestId: number): Promise<ContestDetail> {
  return http.get(API_ENDPOINTS.contests.detail(contestId))
}

export function getContestProblem(contestId: number, index: string): Promise<ProblemDetail> {
  return http.get(API_ENDPOINTS.contests.problem(contestId, index))
}

export function getContestBoardPage(
  contestId: number,
  query: PageQuery,
): Promise<ContestBoardPage> {
  return http.get(API_ENDPOINTS.contests.board(contestId), { params: query })
}

export function registerContest(contestId: number): Promise<void> {
  return http.post(API_ENDPOINTS.contests.register, { contestId })
}

export function unregisterContest(contestId: number): Promise<void> {
  return http.delete(API_ENDPOINTS.contests.register, { data: { contestId } })
}
