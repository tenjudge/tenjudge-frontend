export type AgentAttachment =
  | { type: 'code'; content: string }
  | { type: 'problem'; problem_id: number }
  | { type: 'submission'; submission_id: number }

export type AgentAttachmentType = AgentAttachment['type']

export interface AgentChatRequest {
  conversation_id?: string | null
  message: string
  turn_index?: number | null
  attachments?: AgentAttachment[]
}

export interface AgentChatResponse {
  conversation_id: string
  task_id: string
}

export interface AgentConversationListItem {
  id: string
  title: string | null
}

export interface AgentConversationListResponse {
  items: AgentConversationListItem[]
  next_cursor?: string | null
}

export interface AgentConversationMessage {
  turn_index: number
  role: 'user' | 'agent'
  content: string
  attachments: AgentAttachment[]
}

export interface AgentConversationDetail {
  id: string
  title?: string | null
  status: 'finished' | 'running'
  running_task_id?: string | null
  messages: AgentConversationMessage[]
}

export type AgentStreamEventName = 'progress' | 'message' | 'title' | 'failed' | 'done'

export interface AgentStreamEvent {
  id?: string
  event: AgentStreamEventName
  data: string
}

export interface AgentStreamOptions {
  signal?: AbortSignal
  lastEventId?: string
  onEvent: (event: AgentStreamEvent) => void
}

export type AgentMessageSegment =
  | { type: 'progress'; items: string[] }
  | { type: 'message'; content: string }

export interface AgentChatMessage {
  id: string
  turnIndex: number
  role: 'user' | 'agent'
  content: string
  attachments: AgentAttachment[]
  streaming?: boolean
  failed?: boolean
  segments?: AgentMessageSegment[]
}
