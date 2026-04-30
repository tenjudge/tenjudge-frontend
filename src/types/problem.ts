export interface ProblemListItem {
  id: number
  name: string
  difficulty?: number
}

export interface ProblemDetail {
  id: number
  authorId?: number
  visibility?: string
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

