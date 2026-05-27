<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import hljs from 'highlight.js/lib/core'
import cpp from 'highlight.js/lib/languages/cpp'
import python from 'highlight.js/lib/languages/python'

import { getSubmissionDetail } from '@/api/submissions'
import { getSubmissionStatusLabel, SUBMISSION_STATUS_COLORS } from '@/constants/submission'
import type { SubmissionDetail } from '@/types/submission'
import { toAppError } from '@/utils/error'
import { formatDateTime } from '@/utils/datetime'

hljs.registerLanguage('cpp', cpp)
hljs.registerLanguage('python', python)

const route = useRoute()
const router = useRouter()

const submission = shallowRef<SubmissionDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const expandedTestCase = ref<number | null>(null)

const submissionId = computed(() => Number(route.params.submissionId))

const highlightedCode = computed(() => {
  if (!submission.value?.code) return ''
  const lang = submission.value.language
  if (hljs.getLanguage(lang)) {
    return hljs.highlight(submission.value.code, { language: lang }).value
  }
  return hljs.highlightAuto(submission.value.code).value
})

const testCasesCount = computed(() => submission.value?.details.length ?? 0)

function toggleTestCase(testCaseId: number) {
  expandedTestCase.value = expandedTestCase.value === testCaseId ? null : testCaseId
}

function goBack() {
  router.back()
}

function askAgent() {
  if (!submission.value) return
  router.push({
    name: 'agent',
    query: {
      redirect: route.fullPath,
      attach: `submission:${submission.value.id}`,
    },
  })
}

onMounted(() => {
  void loadSubmission()
})

async function loadSubmission() {
  loading.value = true
  errorMessage.value = ''

  try {
    submission.value = await getSubmissionDetail(submissionId.value)
  } catch (error) {
    errorMessage.value = toAppError(error, 'Unable to load submission detail.').message
  } finally {
    loading.value = false
  }
}

const loadingRows = Array.from({ length: 3 }, (_, i) => i)
</script>

<template>
  <section class="page" aria-labelledby="submission-detail-title">
    <div v-if="errorMessage" class="form-error">{{ errorMessage }}</div>

    <template v-if="!errorMessage">
      <header class="page-header">
        <button class="back-link" type="button" @click="goBack">
          ← Back
        </button>
        <div class="submission-header-row">
          <h1 v-if="submission" id="submission-detail-title" class="page-title">
            Submission #{{ submission.id }}
          </h1>
          <button v-if="submission" class="ask-agent-button" type="button" @click="askAgent">
            Ask Agent
          </button>
        </div>
      </header>

      <!-- Loading skeleton -->
      <template v-if="loading && !submission">
        <div class="detail-section skeleton-block">
          <span class="skeleton-line skeleton-line--wide" />
          <span class="skeleton-line" />
          <span class="skeleton-line skeleton-line--short" />
        </div>
      </template>

      <!-- Content -->
      <template v-else-if="submission">
        <!-- Summary -->
        <div class="detail-section summary-grid">
          <div class="summary-grid__item">
            <span class="summary-grid__label">Problem</span>
            <span class="summary-grid__value">
              <RouterLink :to="`/problems/${submission.problemId}`">
                {{ submission.problemName }}
              </RouterLink>
            </span>
          </div>
          <div class="summary-grid__item">
            <span class="summary-grid__label">Language</span>
            <span class="summary-grid__value lang">{{ submission.language }}</span>
          </div>
          <div class="summary-grid__item">
            <span class="summary-grid__label">Status</span>
            <span
              class="summary-grid__value status"
              :style="{ color: SUBMISSION_STATUS_COLORS[submission.status] }"
            >
              {{ getSubmissionStatusLabel(submission.status) }}
            </span>
          </div>
          <div class="summary-grid__item">
            <span class="summary-grid__label">Time</span>
            <span class="summary-grid__value">{{ submission.time }}ms</span>
          </div>
          <div class="summary-grid__item">
            <span class="summary-grid__label">Memory</span>
            <span class="summary-grid__value">{{ submission.memory }}MB</span>
          </div>
          <div class="summary-grid__item">
            <span class="summary-grid__label">Submitted</span>
            <span class="summary-grid__value">{{ formatDateTime(submission.submitTime) }}</span>
          </div>
        </div>

        <!-- Overall info message (compile error, etc.) -->
        <div v-if="submission.info" class="detail-section info-message">
          {{ submission.info }}
        </div>

        <!-- Source Code -->
        <div class="detail-section">
          <h2 class="section-title">Source Code</h2>
          <div class="code-block">
            <pre><code v-html="highlightedCode" /></pre>
          </div>
        </div>

        <!-- Test Cases -->
        <div class="detail-section">
          <h2 class="section-title">Test Cases ({{ testCasesCount }})</h2>
          <div v-if="testCasesCount === 0" class="panel placeholder">
            <p>No test case details available.</p>
          </div>
          <div v-else class="table-frame">
            <table class="testcases-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Memory</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="tc in submission.details" :key="tc.testCaseId">
                  <tr
                    class="testcases-table__row"
                    :class="{ 'is-expanded': expandedTestCase === tc.testCaseId }"
                    @click="toggleTestCase(tc.testCaseId)"
                  >
                    <td class="testcases-table__id">{{ tc.testCaseId }}</td>
                    <td>
                      <span
                        class="status"
                        :style="{ color: SUBMISSION_STATUS_COLORS[tc.status] }"
                      >
                        {{ getSubmissionStatusLabel(tc.status) }}
                      </span>
                    </td>
                    <td class="testcases-table__metric">{{ tc.time }}ms</td>
                    <td class="testcases-table__metric">{{ tc.memory }}MB</td>
                  </tr>
                  <tr
                    v-if="expandedTestCase === tc.testCaseId"
                    class="testcases-table__detail"
                  >
                    <td colspan="4">
                      <div class="testcase-detail">
                        <div v-if="tc.input != null" class="testcase-detail__item">
                          <span class="testcase-detail__label">Input</span>
                          <pre class="testcase-detail__content">{{ tc.input }}</pre>
                        </div>
                        <div v-if="tc.output != null" class="testcase-detail__item">
                          <span class="testcase-detail__label">Output</span>
                          <pre class="testcase-detail__content">{{ tc.output }}</pre>
                        </div>
                        <div v-if="tc.answer != null" class="testcase-detail__item">
                          <span class="testcase-detail__label">Answer</span>
                          <pre class="testcase-detail__content">{{ tc.answer }}</pre>
                        </div>
                        <div v-if="tc.info" class="testcase-detail__item">
                          <span class="testcase-detail__label">Info</span>
                          <pre class="testcase-detail__content">{{ tc.info }}</pre>
                        </div>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </template>
    </template>
  </section>
</template>

<style scoped>
/* Back link */

.back-link {
  display: inline-block;
  margin-bottom: 8px;
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-text-subtle);
  font-size: 13px;
  cursor: pointer;
}

.back-link:hover {
  color: var(--color-text);
}

.submission-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.submission-header-row .page-title {
  margin: 0;
}

.ask-agent-button {
  min-height: 34px;
  padding: 0 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: 4px;
  background: var(--color-text);
  color: var(--color-surface);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

/* Sections */

.detail-section {
  margin-top: 20px;
}

.section-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

/* Summary grid */

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px 24px;
  padding: 18px 24px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.summary-grid__item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.summary-grid__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-subtle);
  text-transform: uppercase;
}

.summary-grid__value {
  font-size: 14px;
  font-weight: 650;
  color: var(--color-text);
}

.summary-grid__value.lang {
  text-transform: uppercase;
}

.summary-grid__value.status {
  font-weight: 700;
}

.summary-grid__value a {
  color: var(--color-text);
  text-decoration: none;
}

.summary-grid__value a:hover {
  text-decoration: underline;
}

/* Info message (compile error etc.) */

.info-message {
  padding: 14px 18px;
  border: 1px solid var(--color-warning);
  border-radius: 4px;
  background: #fffdf5;
  color: var(--color-text);
  font-size: 13px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-word;
}

/* Source code */

.code-block {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.code-block pre {
  margin: 0;
  padding: 18px 24px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
}

.code-block code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

/* Test cases table */

.table-frame {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  overflow-x: auto;
}

.testcases-table {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
}

.testcases-table th,
.testcases-table td {
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.testcases-table th:last-child,
.testcases-table td:last-child {
  border-right: 0;
}

.testcases-table th {
  height: 36px;
  background: #64748b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.testcases-table td {
  height: 39px;
  padding: 0 16px;
  color: var(--color-text);
  font-size: 14px;
}

.testcases-table th:nth-child(1),
.testcases-table__id {
  width: 8%;
  text-align: center;
}

.testcases-table th:nth-child(2),
.testcases-table td:nth-child(2) {
  width: 42%;
  text-align: center;
}

.testcases-table th:nth-child(3),
.testcases-table th:nth-child(4) {
  width: 25%;
  text-align: center;
}

.testcases-table__metric {
  text-align: center;
  font-weight: 500;
  font-size: 13px;
  color: var(--color-text-subtle);
}

.testcases-table__row {
  cursor: pointer;
}

.testcases-table__row:hover {
  background: #f1f5f9;
}

.testcases-table__row.is-expanded {
  background: #f1f5f9;
}

.status {
  font-weight: 650;
  font-size: 13px;
}

/* Test case detail (expanded) */

.testcases-table__detail td {
  padding: 0;
  background: #fafbfc;
}

.testcase-detail {
  padding: 14px 24px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.testcase-detail__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.testcase-detail__label {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-subtle);
  text-transform: uppercase;
}

.testcase-detail__content {
  margin: 0;
  padding: 10px 14px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  font-size: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 240px;
  overflow-y: auto;
}

/* Skeleton */

.skeleton-block {
  padding: 18px 24px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  display: grid;
  gap: 10px;
}

.skeleton-line {
  display: block;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #edf2f7 0%, #f7f9fb 50%, #edf2f7 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s linear infinite;
}

.skeleton-line--wide {
  width: 86%;
}

.skeleton-line--short {
  width: 56%;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive */

@media (max-width: 640px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

}
</style>
