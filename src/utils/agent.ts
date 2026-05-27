import type { LocationQueryValue } from 'vue-router'

import type { AgentAttachment } from '@/types/agent'

export function formatAgentAttachment(attachment: AgentAttachment): string {
  if (attachment.type === 'problem') return `Problem #${attachment.problem_id}`
  if (attachment.type === 'submission') return `Submission #${attachment.submission_id}`
  return 'Code'
}

export function parseAgentAttachmentQuery(
  value: LocationQueryValue | LocationQueryValue[] | undefined,
): AgentAttachment[] {
  if (value === undefined) return []
  const values = Array.isArray(value) ? value : [value]
  const attachments: AgentAttachment[] = []

  for (const item of values) {
    if (!item) continue
    const [type, id] = item.split(':')
    const numericId = Number(id)

    if (!Number.isInteger(numericId) || numericId <= 0) continue

    if (type === 'problem') {
      attachments.push({ type: 'problem', problem_id: numericId })
    } else if (type === 'submission') {
      attachments.push({ type: 'submission', submission_id: numericId })
    }
  }

  return attachments
}

export function normalizeAgentRedirect(
  value: LocationQueryValue | LocationQueryValue[] | undefined,
): string {
  const redirect = Array.isArray(value) ? value[0] : value
  if (!redirect || !redirect.startsWith('/') || redirect.startsWith('//')) {
    return '/contests'
  }
  if (redirect.startsWith('/agent')) {
    return '/contests'
  }
  return redirect
}
