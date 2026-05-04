import { API_ENDPOINTS } from '@/api/endpoints'
import { http } from '@/api/client'
import type { PageQuery, PageResult } from '@/types/common'
import type {
  AdminProblemListItem,
  AdminProblemPageQuery,
  CreateProblemResult,
  ProblemDetail,
  ProblemVisibilityUpdateRequest,
  ProblemListItem,
} from '@/types/problem'

export function getProblemPage(query: PageQuery): Promise<PageResult<ProblemListItem>> {
  return http.get(API_ENDPOINTS.problems.list, { params: query })
}

export function getAdminProblemPage(
  query: AdminProblemPageQuery,
): Promise<PageResult<AdminProblemListItem>> {
  return http.get(API_ENDPOINTS.problems.adminList, { params: query })
}

export function getMyAdminProblemPage(
  query: AdminProblemPageQuery,
): Promise<PageResult<AdminProblemListItem>> {
  return http.get(API_ENDPOINTS.problems.adminMine, { params: query })
}

export function getProblemDetail(id: number): Promise<ProblemDetail> {
  return http.get(API_ENDPOINTS.problems.detail(id))
}

export function createProblem(zipFile: File): Promise<CreateProblemResult> {
  const formData = new FormData()
  formData.append('zipFile', zipFile)

  return http.post(API_ENDPOINTS.problems.list, formData)
}

export function updateProblemByZip(id: number, zipFile: File): Promise<void> {
  const formData = new FormData()
  formData.append('id', String(id))
  formData.append('zipFile', zipFile)

  return http.put(API_ENDPOINTS.problems.list, formData)
}

export function updateProblemVisibility(payload: ProblemVisibilityUpdateRequest): Promise<void> {
  return http.patch(API_ENDPOINTS.problems.visibility, payload)
}
