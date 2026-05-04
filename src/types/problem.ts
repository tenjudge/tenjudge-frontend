import type { ProblemVisibility } from '@/constants/problem'

export interface ProblemListItem {
  id: number
  name: string
  difficulty?: number
}

export interface AdminProblemListItem {
  id: number
  name: string
  visibility: string
}

export interface CreateProblemResult {
  id: number
  name: string
}

export interface AdminProblemPageQuery {
  current: number
  size: number
  order?: 'asc' | 'desc'
}

export interface ProblemDetail {
  id: number
  authorId?: number
  visibility?: ProblemVisibility | string
  checker?: string
  timeLimit?: number
  memoryLimit?: number
  name: string
  statement: string
  solution?: string
  difficulty?: number
  version?: number
  tags?: string[]
}

export interface ProblemVisibilityUpdateRequest {
  id: number
  visibility: ProblemVisibility
}
