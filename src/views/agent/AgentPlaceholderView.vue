<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  ArrowLeftIcon,
  ClipboardListIcon,
  Code2Icon,
  FileTextIcon,
  Loader2Icon,
  MessageSquareIcon,
  PlusIcon,
  RotateCcwIcon,
  SquareIcon,
  XIcon,
} from 'lucide-vue-next'

import {
  getAgentConversationDetail,
  getAgentConversations,
  streamAgentEvents,
  submitAgentChat,
} from '@/api/agent'
import { useToast } from '@/composables/useToast'
import type {
  AgentAttachment,
  AgentChatMessage,
  AgentConversationListItem,
  AgentMessageSegment,
  AgentStreamEvent,
} from '@/types/agent'
import { formatAgentAttachment, normalizeAgentRedirect, parseAgentAttachmentQuery } from '@/utils/agent'
import { toAppError } from '@/utils/error'
import { renderMarkdown } from '@/utils/markdown'

const CONVERSATION_PAGE_SIZE = 30

const route = useRoute()
const router = useRouter()
const toast = useToast()

const conversations = ref<AgentConversationListItem[]>([])
const nextCursor = ref<string | null>(null)
const loadingConversations = ref(false)
const loadingMoreConversations = ref(false)
const loadingConversationDetail = ref(false)

const currentConversationId = ref<string | null>(null)
const currentTitle = ref<string | null>(null)
const messages = ref<AgentChatMessage[]>([])
const input = ref('')
const pendingAttachments = ref<AgentAttachment[]>([])
const restartTurnIndex = ref<number | null>(null)

const attachmentMenuOpen = ref(false)
const codeDialogOpen = ref(false)
const codeDraft = ref('')
const idDialogKind = ref<'problem' | 'submission' | null>(null)
const idDraft = ref('')
const isComposing = ref(false)
const sending = ref(false)
const streaming = ref(false)

const messageListRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLTextAreaElement | null>(null)
const activeStreamController = ref<AbortController | null>(null)
const lastEventId = ref<string | undefined>()
const previousHtmlOverflow = ref('')
const previousHtmlOverscroll = ref('')
const previousBodyOverflow = ref('')
const previousBodyOverscroll = ref('')

const returnTarget = computed(() => normalizeAgentRedirect(route.query.redirect))
const canSend = computed(() => input.value.trim().length > 0 && !sending.value && !streaming.value)
const hasMoreConversations = computed(() => Boolean(nextCursor.value))

onMounted(() => {
  lockPageScroll()
  void loadConversations()
  applyQueryAttachments()
  applyQueryConversation()
  adjustInputHeight()
})

onUnmounted(() => {
  activeStreamController.value?.abort()
  unlockPageScroll()
})

watch(
  messages,
  () => {
    void scrollToBottom()
  },
  { deep: true },
)

watch(input, () => {
  void nextTick(adjustInputHeight)
})

function makeMessageId(role: AgentChatMessage['role'], turnIndex: number) {
  return `${role}-${turnIndex}-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

function lockPageScroll() {
  previousHtmlOverflow.value = document.documentElement.style.overflow
  previousHtmlOverscroll.value = document.documentElement.style.overscrollBehavior
  previousBodyOverflow.value = document.body.style.overflow
  previousBodyOverscroll.value = document.body.style.overscrollBehavior

  document.documentElement.style.overflow = 'hidden'
  document.documentElement.style.overscrollBehavior = 'none'
  document.body.style.overflow = 'hidden'
  document.body.style.overscrollBehavior = 'none'
}

function unlockPageScroll() {
  document.documentElement.style.overflow = previousHtmlOverflow.value
  document.documentElement.style.overscrollBehavior = previousHtmlOverscroll.value
  document.body.style.overflow = previousBodyOverflow.value
  document.body.style.overscrollBehavior = previousBodyOverscroll.value
}

async function scrollToBottom() {
  await nextTick()
  const element = messageListRef.value
  if (!element) return
  element.scrollTop = element.scrollHeight
}

function applyQueryAttachments() {
  if (!route.query.attach) return
  pendingAttachments.value = [
    ...pendingAttachments.value,
    ...parseAgentAttachmentQuery(route.query.attach),
  ]
}

function applyQueryConversation() {
  const value = Array.isArray(route.query.conversation)
    ? route.query.conversation[0]
    : route.query.conversation
  if (value) {
    void selectConversation(value)
  }
}

function updateConversationQuery(conversationId: string | null) {
  const nextQuery = { ...route.query }
  if (conversationId) {
    nextQuery.conversation = conversationId
  } else {
    delete nextQuery.conversation
  }
  delete nextQuery.attach

  router.replace({ query: nextQuery }).catch(() => {})
}

function adjustInputHeight() {
  const textarea = inputRef.value
  if (!textarea) return

  textarea.style.height = 'auto'
  const nextHeight = Math.min(textarea.scrollHeight, 180)
  textarea.style.height = `${Math.max(nextHeight, 36)}px`
}

async function loadConversations(cursor?: string | null) {
  if (cursor) {
    loadingMoreConversations.value = true
  } else {
    loadingConversations.value = true
  }

  try {
    const result = await getAgentConversations({
      limit: CONVERSATION_PAGE_SIZE,
      cursor,
    })

    conversations.value = cursor
      ? [...conversations.value, ...result.items]
      : result.items
    nextCursor.value = result.next_cursor ?? null
  } catch (error) {
    toast.error(toAppError(error, 'Failed to load conversations.').message)
  } finally {
    loadingConversations.value = false
    loadingMoreConversations.value = false
  }
}

async function loadMoreConversations() {
  if (!nextCursor.value || loadingMoreConversations.value) return
  await loadConversations(nextCursor.value)
}

function handleConversationListScroll(event: Event) {
  const element = event.currentTarget as HTMLElement
  const remaining = element.scrollHeight - element.scrollTop - element.clientHeight
  if (remaining < 80) {
    void loadMoreConversations()
  }
}

async function selectConversation(conversationId: string) {
  if (currentConversationId.value === conversationId) return

  activeStreamController.value?.abort()
  streaming.value = false
  loadingConversationDetail.value = true

  try {
    const detail = await getAgentConversationDetail(conversationId)
    currentConversationId.value = detail.id
    currentTitle.value = detail.title ?? null
    updateConversationQuery(detail.id)
    restartTurnIndex.value = null
    messages.value = detail.messages.map((item, index) => ({
      id: `${item.role}-${item.turn_index}-${index}`,
      turnIndex: item.turn_index,
      role: item.role,
      content: item.content,
      attachments: item.attachments,
    }))

    if (detail.status === 'running' && detail.running_task_id) {
      const agentMessage = ensureStreamingAgentMessage()
      void startStream(detail.running_task_id, agentMessage.id)
    }
  } catch (error) {
    toast.error(toAppError(error, 'Failed to load conversation.').message)
  } finally {
    loadingConversationDetail.value = false
  }
}

function startNewChat() {
  activeStreamController.value?.abort()
  currentConversationId.value = null
  currentTitle.value = null
  messages.value = []
  input.value = ''
  pendingAttachments.value = []
  restartTurnIndex.value = null
  streaming.value = false
  updateConversationQuery(null)
  void nextTick(adjustInputHeight)
}

function goBack() {
  router.push(returnTarget.value)
}

function nextTurnIndex() {
  return messages.value.reduce((max, message) => Math.max(max, message.turnIndex), 0) + 1
}

function copyAttachments(items: AgentAttachment[]): AgentAttachment[] {
  return items.map((item) => ({ ...item }))
}

function prepareRestart(message: AgentChatMessage) {
  input.value = message.content
  pendingAttachments.value = copyAttachments(message.attachments)
  restartTurnIndex.value = message.turnIndex
  void nextTick(adjustInputHeight)
  void scrollToBottom()
}

function cancelRestart() {
  restartTurnIndex.value = null
}

function addCodeAttachment() {
  const content = codeDraft.value.trim()
  if (!content) return
  pendingAttachments.value.push({ type: 'code', content })
  codeDraft.value = ''
  codeDialogOpen.value = false
}

function openIdDialog(kind: 'problem' | 'submission') {
  idDialogKind.value = kind
  idDraft.value = ''
  attachmentMenuOpen.value = false
}

function addIdAttachment() {
  const id = Number(idDraft.value)
  if (!Number.isInteger(id) || id <= 0 || !idDialogKind.value) {
    toast.error('Please enter a valid positive ID.')
    return
  }

  if (idDialogKind.value === 'problem') {
    pendingAttachments.value.push({ type: 'problem', problem_id: id })
  } else {
    pendingAttachments.value.push({ type: 'submission', submission_id: id })
  }

  idDialogKind.value = null
  idDraft.value = ''
}

function removeAttachment(index: number) {
  pendingAttachments.value.splice(index, 1)
}

function trimMessagesForRestart(turnIndex: number) {
  messages.value = messages.value.filter((message) => message.turnIndex < turnIndex)
}

async function handleSend() {
  const messageText = input.value.trim()
  if (!messageText || sending.value || streaming.value) return

  const restartIndex = restartTurnIndex.value
  const turnIndex = restartIndex ?? nextTurnIndex()
  const attachments = copyAttachments(pendingAttachments.value)

  if (restartIndex !== null) {
    trimMessagesForRestart(restartIndex)
  }

  const userMessage: AgentChatMessage = {
    id: makeMessageId('user', turnIndex),
    turnIndex,
    role: 'user',
    content: messageText,
    attachments,
  }
  const agentMessage: AgentChatMessage = {
    id: makeMessageId('agent', turnIndex),
    turnIndex,
    role: 'agent',
    content: '',
    attachments: [],
    streaming: true,
    segments: [],
  }

  messages.value.push(userMessage, agentMessage)
  input.value = ''
  pendingAttachments.value = []
  restartTurnIndex.value = null
  sending.value = true
  streaming.value = true
  void nextTick(adjustInputHeight)

  try {
    const response = await submitAgentChat({
      conversation_id: currentConversationId.value,
      message: messageText,
      turn_index: restartIndex,
      attachments,
    })

    currentConversationId.value = response.conversation_id
    updateConversationQuery(response.conversation_id)
    upsertConversation(response.conversation_id, currentTitle.value)
    await startStream(response.task_id, agentMessage.id)
  } catch (error) {
    agentMessage.streaming = false
    agentMessage.failed = true
    agentMessage.content = toAppError(error, 'Failed to send message.').message
    toast.error(agentMessage.content)
  } finally {
    sending.value = false
    streaming.value = false
  }
}

function ensureStreamingAgentMessage(): AgentChatMessage {
  const last = messages.value[messages.value.length - 1]
  if (last?.role === 'agent') {
    last.streaming = true
    last.segments = last.segments ?? (last.content ? [{ type: 'message', content: last.content }] : [])
    return last
  }

  const turnIndex = last?.turnIndex ?? nextTurnIndex()
  const message: AgentChatMessage = {
    id: makeMessageId('agent', turnIndex),
    turnIndex,
    role: 'agent',
    content: '',
    attachments: [],
    streaming: true,
    segments: [],
  }
  messages.value.push(message)
  return message
}

function upsertConversation(id: string, title: string | null) {
  const existing = conversations.value.find((item) => item.id === id)
  if (existing) {
    existing.title = title
    conversations.value = [
      existing,
      ...conversations.value.filter((item) => item.id !== id),
    ]
    return
  }

  conversations.value = [{ id, title }, ...conversations.value]
}

function findMessage(messageId: string) {
  return messages.value.find((message) => message.id === messageId)
}

function appendProgress(message: AgentChatMessage, data: string) {
  const text = data.trim()
  if (!text) return

  const segments = message.segments ?? []
  const last = segments[segments.length - 1]
  if (last?.type === 'progress') {
    last.items.push(text)
  } else {
    segments.push({ type: 'progress', items: [text] })
  }
  message.segments = segments
}

function appendMessageContent(message: AgentChatMessage, data: string) {
  const segments = message.segments ?? []
  const last = segments[segments.length - 1]
  if (last?.type === 'message') {
    last.content += data
  } else {
    segments.push({ type: 'message', content: data })
  }
  message.segments = segments
  message.content += data
}

function handleStreamEvent(agentMessageId: string, event: AgentStreamEvent) {
  if (event.id) {
    lastEventId.value = event.id
  }

  const message = findMessage(agentMessageId)
  if (!message) return

  if (event.event === 'progress') {
    appendProgress(message, event.data)
  } else if (event.event === 'message') {
    appendMessageContent(message, event.data)
  } else if (event.event === 'title') {
    currentTitle.value = event.data || currentTitle.value
    if (currentConversationId.value) {
      upsertConversation(currentConversationId.value, currentTitle.value)
    }
  } else if (event.event === 'failed') {
    message.failed = true
    message.streaming = false
    if (event.data) appendMessageContent(message, event.data)
    toast.error(event.data || 'Agent task failed.')
  } else if (event.event === 'done') {
    message.streaming = false
  }
}

async function startStream(taskId: string, agentMessageId: string) {
  activeStreamController.value?.abort()
  const controller = new AbortController()
  activeStreamController.value = controller
  lastEventId.value = undefined
  streaming.value = true

  try {
    await streamAgentEvents(taskId, {
      signal: controller.signal,
      lastEventId: lastEventId.value,
      onEvent: (event) => handleStreamEvent(agentMessageId, event),
    })
  } catch (error) {
    if (controller.signal.aborted) return
    const message = findMessage(agentMessageId)
    if (message) {
      message.failed = true
      message.streaming = false
      message.content ||= toAppError(error, 'Agent stream interrupted.').message
    }
    toast.error(toAppError(error, 'Agent stream interrupted.').message)
  } finally {
    const message = findMessage(agentMessageId)
    if (message) {
      message.streaming = false
    }
    if (activeStreamController.value === controller) {
      activeStreamController.value = null
    }
    streaming.value = false
  }
}

function handleTextareaKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' || event.shiftKey || isComposing.value) return
  event.preventDefault()
  void handleSend()
}

function renderContent(content: string) {
  return renderMarkdown(content)
}

function renderMessageSegments(segments: AgentMessageSegment[] | undefined) {
  return segments ?? []
}
</script>

<template>
  <section class="agent-page" aria-label="Agent chat">
    <aside class="agent-sidebar">
      <div class="agent-sidebar__header">
        <button class="agent-icon-button" type="button" aria-label="Back to TenJudge" @click="goBack">
          <ArrowLeftIcon :size="18" />
        </button>
        <span class="agent-sidebar__brand">TenJudge Agent</span>
      </div>

      <button class="agent-new-chat" type="button" @click="startNewChat">
        <PlusIcon :size="16" />
        New chat
      </button>

      <div class="agent-sidebar__label">Conversations</div>
      <div class="agent-conversations" @scroll="handleConversationListScroll">
        <p v-if="loadingConversations" class="agent-muted">Loading conversations...</p>
        <button
          v-for="conversation in conversations"
          :key="conversation.id"
          class="agent-conversation"
          :class="{ 'is-active': conversation.id === currentConversationId }"
          type="button"
          @click="selectConversation(conversation.id)"
        >
          <MessageSquareIcon :size="15" />
          <span>{{ conversation.title || 'Untitled conversation' }}</span>
        </button>
        <button
          v-if="hasMoreConversations"
          class="agent-load-more"
          type="button"
          :disabled="loadingMoreConversations"
          @click="loadMoreConversations"
        >
          {{ loadingMoreConversations ? 'Loading...' : 'Load more' }}
        </button>
        <p v-if="!loadingConversations && conversations.length === 0" class="agent-muted">
          No conversations yet.
        </p>
      </div>
    </aside>

    <main class="agent-main">
      <div ref="messageListRef" class="agent-messages">
        <div v-if="loadingConversationDetail" class="agent-empty">
          <MessageSquareIcon :size="26" />
          <p>Loading conversation...</p>
        </div>

        <div v-else-if="messages.length === 0" class="agent-empty">
          <MessageSquareIcon :size="30" />
          <h1>Agent</h1>
          <p>Ask about a problem, a submission, or a piece of code.</p>
        </div>

        <template v-else>
          <article
            v-for="message in messages"
            :key="message.id"
            class="agent-message"
            :class="[`agent-message--${message.role}`, message.failed && 'is-failed']"
          >
            <div class="agent-message__meta">
              <span>{{ message.role === 'user' ? 'You' : 'Agent' }}</span>
              <button
                v-if="message.role === 'user'"
                class="agent-restart"
                type="button"
                @click="prepareRestart(message)"
              >
                <RotateCcwIcon :size="13" />
                Restart from here
              </button>
            </div>

            <div v-if="message.attachments.length > 0" class="agent-attachments">
              <span
                v-for="(attachment, index) in message.attachments"
                :key="`${message.id}-${index}`"
                class="agent-chip"
              >
                {{ formatAgentAttachment(attachment) }}
              </span>
            </div>

            <div class="agent-message__body">
              <template v-if="message.role === 'agent' && message.segments">
                <template v-for="(segment, index) in renderMessageSegments(message.segments)" :key="`${message.id}-segment-${index}`">
                  <div v-if="segment.type === 'progress'" class="agent-progress-line">
                    <span v-for="(item, itemIndex) in segment.items" :key="`${item}-${itemIndex}`">
                      {{ item }}
                    </span>
                  </div>
                  <div v-else class="agent-markdown" v-html="renderContent(segment.content)" />
                </template>
              </template>
              <div
                v-else-if="message.role === 'agent'"
                class="agent-markdown"
                v-html="renderContent(message.content)"
              />
              <p v-else>{{ message.content }}</p>
              <span v-if="message.streaming" class="agent-cursor" aria-hidden="true" />
            </div>
          </article>
        </template>
      </div>

      <form class="agent-composer" @submit.prevent="handleSend">
        <div v-if="restartTurnIndex !== null" class="agent-restart-banner">
          <span>Editing from turn {{ restartTurnIndex }}. Sending will replace that turn and later messages.</span>
          <button type="button" @click="cancelRestart">Cancel</button>
        </div>

        <div v-if="pendingAttachments.length > 0" class="agent-pending">
          <span
            v-for="(attachment, index) in pendingAttachments"
            :key="`${attachment.type}-${index}`"
            class="agent-chip agent-chip--removable"
          >
            {{ formatAgentAttachment(attachment) }}
            <button type="button" :aria-label="`Remove ${formatAgentAttachment(attachment)}`" @click="removeAttachment(index)">
              <XIcon :size="12" />
            </button>
          </span>
        </div>

        <div class="agent-composer__box">
          <div class="agent-attachment-menu">
            <button
              class="agent-icon-button"
              type="button"
              aria-label="Add attachment"
              @click="attachmentMenuOpen = !attachmentMenuOpen"
            >
              <PlusIcon :size="18" />
            </button>
            <div v-if="attachmentMenuOpen" class="agent-menu">
              <button type="button" @click="codeDialogOpen = true; attachmentMenuOpen = false">
                <Code2Icon :size="15" />
                Code
              </button>
              <button type="button" @click="openIdDialog('problem')">
                <FileTextIcon :size="15" />
                Problem
              </button>
              <button type="button" @click="openIdDialog('submission')">
                <ClipboardListIcon :size="15" />
                Submission
              </button>
            </div>
          </div>

          <textarea
            ref="inputRef"
            v-model="input"
            class="agent-input"
            rows="1"
            placeholder="Message Agent"
            :disabled="sending || streaming"
            @keydown="handleTextareaKeydown"
            @compositionstart="isComposing = true"
            @compositionend="isComposing = false"
          />

          <button class="agent-send" type="submit" :disabled="!canSend" aria-label="Send message">
            <Loader2Icon v-if="sending" class="agent-send__spinner" :size="17" />
            <SquareIcon v-else-if="streaming" :size="15" />
            <ArrowLeftIcon v-else class="agent-send__arrow" :size="17" />
          </button>
        </div>
      </form>
    </main>

    <div v-if="codeDialogOpen" class="agent-dialog" role="dialog" aria-modal="true" aria-labelledby="code-dialog-title">
      <div class="agent-dialog__panel">
        <header>
          <h2 id="code-dialog-title">Add code</h2>
          <button class="agent-icon-button" type="button" aria-label="Close" @click="codeDialogOpen = false">
            <XIcon :size="18" />
          </button>
        </header>
        <textarea v-model="codeDraft" class="agent-code-input" placeholder="Paste code here" />
        <footer>
          <button class="agent-secondary-button" type="button" @click="codeDialogOpen = false">Cancel</button>
          <button class="agent-primary-button" type="button" @click="addCodeAttachment">Add code</button>
        </footer>
      </div>
    </div>

    <div v-if="idDialogKind" class="agent-dialog" role="dialog" aria-modal="true" aria-labelledby="id-dialog-title">
      <div class="agent-dialog__panel agent-dialog__panel--small">
        <header>
          <h2 id="id-dialog-title">Add {{ idDialogKind }}</h2>
          <button class="agent-icon-button" type="button" aria-label="Close" @click="idDialogKind = null">
            <XIcon :size="18" />
          </button>
        </header>
        <input
          v-model="idDraft"
          class="agent-id-input"
          type="number"
          min="1"
          :placeholder="idDialogKind === 'problem' ? 'Problem ID' : 'Submission ID'"
          @keydown.enter.prevent="addIdAttachment"
        />
        <footer>
          <button class="agent-secondary-button" type="button" @click="idDialogKind = null">Cancel</button>
          <button class="agent-primary-button" type="button" @click="addIdAttachment">Add</button>
        </footer>
      </div>
    </div>
  </section>
</template>

<style scoped>
.agent-page {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  overscroll-behavior: none;
  background: #ffffff;
  color: var(--color-text);
}

.agent-sidebar {
  display: grid;
  grid-template-rows: auto auto auto 1fr;
  min-width: 0;
  min-height: 0;
  border-right: 1px solid var(--color-border);
  background: #f7f8fa;
  overscroll-behavior: contain;
}

.agent-sidebar__header {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 58px;
  padding: 0 14px;
}

.agent-sidebar__brand {
  overflow: hidden;
  font-size: 14px;
  font-weight: 750;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-icon-button,
.agent-send {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
}

.agent-icon-button:hover {
  border-color: var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}

.agent-new-chat {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0 12px 12px;
  padding: 9px 11px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-weight: 650;
  cursor: pointer;
}

.agent-sidebar__label {
  padding: 4px 16px 8px;
  color: var(--color-text-subtle);
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
}

.agent-conversations {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0 10px 16px;
}

.agent-conversation,
.agent-load-more {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 36px;
  padding: 8px 9px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.agent-conversation span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.agent-conversation:hover,
.agent-conversation.is-active,
.agent-load-more:hover {
  background: #e9edf3;
  color: var(--color-text);
}

.agent-muted {
  margin: 12px 6px;
  color: var(--color-text-subtle);
  font-size: 13px;
}

.agent-main {
  display: grid;
  grid-template-rows: 1fr auto;
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  overscroll-behavior: none;
  background: #ffffff;
}

.agent-messages {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 28px max(24px, calc((100vw - 980px) / 2)) 18px;
}

.agent-empty {
  display: grid;
  min-height: 55vh;
  place-items: center;
  align-content: center;
  gap: 8px;
  color: var(--color-text-subtle);
  text-align: center;
}

.agent-empty h1,
.agent-empty p {
  margin: 0;
}

.agent-empty h1 {
  color: var(--color-text);
  font-size: 30px;
}

.agent-message {
  display: grid;
  gap: 8px;
  max-width: 780px;
  margin: 0 auto 26px;
}

.agent-message--user {
  justify-items: end;
}

.agent-message--agent {
  justify-items: start;
}

.agent-message__meta {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--color-text-subtle);
  font-size: 12px;
  font-weight: 700;
}

.agent-restart {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 6px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 12px;
  cursor: pointer;
}

.agent-restart:hover {
  color: var(--color-text);
}

.agent-attachments,
.agent-pending {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.agent-message--user .agent-attachments {
  justify-content: flex-end;
}

.agent-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  max-width: 100%;
  padding: 4px 8px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: #f7f9fb;
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 650;
}

.agent-chip button {
  display: inline-flex;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.agent-message__body {
  max-width: min(100%, 760px);
  color: var(--color-text);
  line-height: 1.65;
}

.agent-message--user .agent-message__body {
  max-width: min(100%, 640px);
  padding: 10px 13px;
  border: 1px solid #d6dde8;
  border-radius: 12px;
  background: #f5f7fb;
}

.agent-message__body p {
  margin: 0;
  white-space: pre-wrap;
}

.agent-markdown :deep(p) {
  margin: 0 0 0.78em;
}

.agent-markdown :deep(p:last-child) {
  margin-bottom: 0;
}

.agent-markdown :deep(pre) {
  overflow-x: auto;
  padding: 12px 14px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: #f7f8fa;
}

.agent-markdown :deep(.markdown-code-block pre) {
  padding: 3px var(--markdown-code-x) 8px;
  border: 0;
  border-radius: 0;
  background: #f7f7f8;
  line-height: 1.45;
}

.agent-markdown :deep(.markdown-code-block code) {
  font-size: 12px;
}

.agent-markdown :deep(code) {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.9em;
}

.agent-progress-line {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 7px;
  margin: 0 0 8px;
  color: var(--color-text-subtle);
  font-size: 13px;
}

.agent-progress-line::before {
  content: '';
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--color-focus);
  animation: agent-pulse 1s ease-in-out infinite;
}

.agent-progress-line span:not(:last-child)::after {
  content: '·';
  margin-left: 7px;
  color: var(--color-text-subtle);
}

.agent-cursor {
  display: inline-block;
  width: 7px;
  height: 16px;
  margin-left: 2px;
  background: var(--color-text);
  vertical-align: -2px;
  animation: agent-blink 1s step-end infinite;
}

.agent-composer {
  display: grid;
  gap: 8px;
  padding: 12px max(24px, calc((100vw - 980px) / 2)) 20px;
  background: #ffffff;
}

.agent-restart-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 10px;
  border: 1px solid rgba(37, 99, 235, 0.25);
  border-radius: var(--radius-sm);
  background: rgba(37, 99, 235, 0.06);
  color: var(--color-text);
  font-size: 13px;
}

.agent-restart-banner button {
  border: 0;
  background: transparent;
  color: var(--color-focus);
  font-weight: 700;
  cursor: pointer;
}

.agent-composer__box {
  position: relative;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 10px;
  padding: 10px 11px;
  border: 1px solid #cfd8e6;
  border-radius: 16px;
  background: var(--color-surface);
  box-shadow: 0 8px 24px rgba(7, 18, 40, 0.07);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.agent-composer__box:focus-within {
  border-color: rgba(37, 99, 235, 0.5);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.1);
}

.agent-input {
  width: 100%;
  max-height: 180px;
  min-height: 36px;
  padding: 6px 0;
  resize: vertical;
  border: 0;
  outline: 0;
  color: var(--color-text);
  font: inherit;
  line-height: 1.45;
  overflow-y: auto;
  resize: none;
  scrollbar-gutter: stable;
  vertical-align: middle;
}

.agent-input::placeholder {
  color: var(--color-text-subtle);
}

.agent-send {
  background: var(--color-text);
  color: var(--color-surface);
  transition:
    transform 0.15s ease,
    background 0.15s ease,
    opacity 0.15s ease;
}

.agent-send:not(:disabled):hover {
  transform: translateY(-1px);
}

.agent-send:disabled {
  background: #d9e0ea;
  color: #667085;
  opacity: 1;
  cursor: not-allowed;
}

.agent-send__arrow {
  transform: rotate(90deg);
}

.agent-send__spinner {
  animation: spin 0.8s linear infinite;
}

.agent-attachment-menu {
  position: relative;
}

.agent-menu {
  position: absolute;
  bottom: 42px;
  left: 0;
  z-index: 10;
  display: grid;
  min-width: 160px;
  padding: 6px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-popover);
}

.agent-menu button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 9px;
  border: 0;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.agent-menu button:hover {
  background: var(--color-background-muted);
}

.agent-dialog {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(7, 18, 40, 0.28);
}

.agent-dialog__panel {
  display: grid;
  gap: 14px;
  width: min(100%, 720px);
  padding: 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  box-shadow: var(--shadow-popover);
}

.agent-dialog__panel--small {
  width: min(100%, 380px);
}

.agent-dialog__panel header,
.agent-dialog__panel footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.agent-dialog__panel h2 {
  margin: 0;
  font-size: 18px;
}

.agent-code-input,
.agent-id-input {
  width: 100%;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font: inherit;
  outline: none;
}

.agent-code-input {
  min-height: 320px;
  padding: 12px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.55;
}

.agent-id-input {
  height: 40px;
  padding: 0 11px;
}

.agent-primary-button,
.agent-secondary-button {
  min-height: 36px;
  padding: 0 12px;
  border-radius: var(--radius-sm);
  font-weight: 650;
  cursor: pointer;
}

.agent-primary-button {
  border: 1px solid var(--color-text);
  background: var(--color-text);
  color: var(--color-surface);
}

.agent-secondary-button {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
}

@keyframes agent-pulse {
  50% {
    opacity: 0.35;
  }
}

@keyframes agent-blink {
  50% {
    opacity: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .agent-page {
    grid-template-columns: minmax(92px, 32vw) minmax(0, 1fr);
  }

  .agent-sidebar {
    position: static;
    width: auto;
  }

  .agent-messages,
  .agent-composer {
    padding-left: 14px;
    padding-right: 14px;
  }
}
</style>
