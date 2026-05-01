export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED: 'Memory Limit Exceeded',
  RUNTIME_ERROR: 'Runtime Error',
  COMPILATION_ERROR: 'Compilation Error',
  PENDING: 'Pending',
  JUDGING: 'Judging',
}

export const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  ACCEPTED: 'var(--color-success)',
  WRONG_ANSWER: 'var(--color-danger)',
  TIME_LIMIT_EXCEEDED: 'var(--color-warning)',
  MEMORY_LIMIT_EXCEEDED: 'var(--color-warning)',
  RUNTIME_ERROR: 'var(--color-danger)',
  COMPILATION_ERROR: 'var(--color-warning)',
  PENDING: 'var(--color-text-muted)',
  JUDGING: 'var(--color-text-muted)',
}

export function getSubmissionStatusLabel(status: string): string {
  return SUBMISSION_STATUS_LABELS[status] ?? status
}
