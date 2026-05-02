export const SUBMISSION_STATUS_LABELS: Record<string, string> = {
  ACCEPTED: 'Accepted',
  WRONG_ANSWER: 'Wrong Answer',
  TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
  MEMORY_LIMIT_EXCEEDED: 'Memory Limit Exceeded',
  RUNTIME_ERROR: 'Runtime Error',
  COMPILE_ERROR: 'Compile Error',
  SYSTEM_ERROR: 'System Error',
  SKIPPED: 'Skipped',
  PENDING: 'Pending',
}

export const SUBMISSION_STATUS_COLORS: Record<string, string> = {
  ACCEPTED: 'var(--color-success)',
  WRONG_ANSWER: 'var(--color-danger)',
  TIME_LIMIT_EXCEEDED: 'var(--color-warning)',
  MEMORY_LIMIT_EXCEEDED: 'var(--color-warning)',
  RUNTIME_ERROR: 'var(--color-danger)',
  COMPILE_ERROR: 'var(--color-warning)',
  SYSTEM_ERROR: 'var(--color-danger)',
  SKIPPED: 'var(--color-text-muted)',
  PENDING: 'var(--color-text-muted)',
}

export function getSubmissionStatusLabel(status: string): string {
  return SUBMISSION_STATUS_LABELS[status] ?? status
}
