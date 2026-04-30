import { API_ENDPOINTS } from '@/api/endpoints'
import { http } from '@/api/client'
import type { PageQuery, PageResult } from '@/types/common'
import type { ProblemDetail, ProblemListItem } from '@/types/problem'

export function getProblemPage(query: PageQuery): Promise<PageResult<ProblemListItem>> {
  return http.get(API_ENDPOINTS.problems.list, { params: query })
}

export function getProblemDetail(id: number): Promise<ProblemDetail> {
  return http.get(API_ENDPOINTS.problems.detail(id))
}

