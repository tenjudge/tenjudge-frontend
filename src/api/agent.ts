import axios, { AxiosError } from 'axios'

import { AGENT_API_BASE_URL, API_SUCCESS_CODE, API_UNAUTHORIZED_CODE } from '@/config/request'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import type {
  AgentChatRequest,
  AgentChatResponse,
  AgentConversationDetail,
  AgentConversationListResponse,
  AgentStreamEvent,
  AgentStreamOptions,
} from '@/types/agent'
import type { ApiResult, AppError } from '@/types/common'

const AGENT_TOKEN_HEADER = 'tenjudge-token'

const agentHttp = axios.create({
  baseURL: AGENT_API_BASE_URL,
  timeout: 15_000,
})

agentHttp.interceptors.request.use((config) => {
  const authStore = useAuthStore()
  if (authStore.tokenValue) {
    config.headers.set(AGENT_TOKEN_HEADER, authStore.tokenValue)
  }
  return config
})

function normalizeAgentError(result: ApiResult<unknown> | undefined, fallback: string): AppError {
  if (result && typeof result.code === 'number') {
    return {
      code: result.code,
      message: result.message || fallback,
      raw: result,
    }
  }

  return {
    message: fallback,
    raw: result,
  }
}

function handleUnauthorized(code?: number) {
  if (code !== API_UNAUTHORIZED_CODE) return
  const authStore = useAuthStore()
  authStore.clearSession()
  router.push({ name: 'login' }).catch(() => {})
}

agentHttp.interceptors.response.use(
  (response) => {
    const result = response.data as ApiResult<unknown>

    if (typeof result?.code === 'number') {
      handleUnauthorized(result.code)

      if (result.code !== API_SUCCESS_CODE) {
        throw normalizeAgentError(result, 'Agent request failed.')
      }

      return result.data
    }

    return response.data
  },
  (error: AxiosError<ApiResult<unknown>>) => {
    const result = error.response?.data
    handleUnauthorized(result?.code)

    return Promise.reject(
      normalizeAgentError(result, error.message || 'Agent service is unavailable.'),
    )
  },
)

export function submitAgentChat(payload: AgentChatRequest): Promise<AgentChatResponse> {
  return agentHttp.post('/chat', payload)
}

export function getAgentConversations(params: {
  limit?: number
  cursor?: string | null
}): Promise<AgentConversationListResponse> {
  return agentHttp.get('/conversations', { params })
}

export function getAgentConversationDetail(conversationId: string): Promise<AgentConversationDetail> {
  return agentHttp.get(`/conversations/${conversationId}`)
}

function getAgentStreamHeaders(lastEventId?: string): Headers {
  const headers = new Headers()
  const authStore = useAuthStore()

  if (authStore.tokenValue) {
    headers.set(AGENT_TOKEN_HEADER, authStore.tokenValue)
  }
  if (lastEventId) {
    headers.set('Last-Event-ID', lastEventId)
  }

  return headers
}

function buildAgentUrl(path: string): string {
  const base = AGENT_API_BASE_URL.replace(/\/$/, '')
  return `${base}${path}`
}

function parseSseBlock(block: string): AgentStreamEvent | null {
  let id: string | undefined
  let event = 'message'
  const dataLines: string[] = []

  for (const line of block.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue

    const separatorIndex = line.indexOf(':')
    const field = separatorIndex >= 0 ? line.slice(0, separatorIndex) : line
    let value = separatorIndex >= 0 ? line.slice(separatorIndex + 1) : ''
    if (value.startsWith(' ')) value = value.slice(1)

    if (field === 'id') {
      id = value
    } else if (field === 'event') {
      event = value
    } else if (field === 'data') {
      dataLines.push(value)
    }
  }

  if (!['progress', 'message', 'title', 'failed', 'done'].includes(event)) {
    return null
  }

  return {
    id,
    event: event as AgentStreamEvent['event'],
    data: dataLines.join('\n'),
  }
}

async function parseJsonError(response: Response): Promise<AppError> {
  try {
    const result = await response.json() as ApiResult<unknown>
    handleUnauthorized(result.code)
    return normalizeAgentError(result, result.message || 'Agent stream failed.')
  } catch {
    return {
      message: `Agent stream failed with status ${response.status}.`,
    }
  }
}

export async function streamAgentEvents(
  taskId: string,
  options: AgentStreamOptions,
): Promise<void> {
  const response = await fetch(buildAgentUrl(`/chat/${taskId}/events`), {
    method: 'GET',
    headers: getAgentStreamHeaders(options.lastEventId),
    signal: options.signal,
  })

  const contentType = response.headers.get('content-type') || ''
  if (!response.ok || !contentType.includes('text/event-stream')) {
    throw await parseJsonError(response)
  }

  const reader = response.body?.getReader()
  if (!reader) {
    throw { message: 'Agent stream is not readable.' } satisfies AppError
  }

  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const blocks = buffer.split(/\r?\n\r?\n/)
    buffer = blocks.pop() ?? ''

    for (const block of blocks) {
      const event = parseSseBlock(block)
      if (event) {
        options.onEvent(event)
      }
    }
  }

  if (buffer.trim()) {
    const event = parseSseBlock(buffer)
    if (event) {
      options.onEvent(event)
    }
  }
}
