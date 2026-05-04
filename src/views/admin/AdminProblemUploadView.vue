<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import {
  createProblem,
  getProblemDetail,
  updateProblemByZip,
  updateProblemVisibility,
} from '@/api/problems'
import BaseButton from '@/components/base/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import {
  PROBLEM_VISIBILITY,
  PROBLEM_VISIBILITY_LABELS,
  type ProblemVisibility,
} from '@/constants/problem'
import { useAuthStore } from '@/stores/auth'
import type { ProblemDetail } from '@/types/problem'
import { toAppError } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const selectedFile = ref<File | null>(null)
const loading = ref(false)
const loadingDetail = ref(false)
const savingVisibility = ref(false)
const errorMessage = ref('')
const visibility = ref<ProblemVisibility>(PROBLEM_VISIBILITY.private)
const detail = shallowRef<ProblemDetail | null>(null)

const problemId = computed(() => {
  const raw = route.params.problemId
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
})
const isEditMode = computed(() => problemId.value !== null)
const pageTitle = computed(() => (isEditMode.value ? 'Edit Problem' : 'New Problem'))
const canManageVisibility = computed(() => isEditMode.value && authStore.isSuperAdmin)
const visibilityOptions = [
  PROBLEM_VISIBILITY.public,
  PROBLEM_VISIBILITY.private,
] as const

watch(
  () => problemId.value,
  () => {
    selectedFile.value = null
    detail.value = null
    if (problemId.value) {
      void loadProblemDetail(problemId.value)
    }
  },
  { immediate: true },
)

async function loadProblemDetail(id: number) {
  loadingDetail.value = true

  try {
    const result = await getProblemDetail(id)
    detail.value = result
    visibility.value = normalizeVisibility(result.visibility)
  } catch {
    detail.value = null
  } finally {
    loadingDetail.value = false
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
}

function normalizeVisibility(value?: string): ProblemVisibility {
  return value === PROBLEM_VISIBILITY.public ? PROBLEM_VISIBILITY.public : PROBLEM_VISIBILITY.private
}

async function handleVisibilitySave() {
  if (!problemId.value) {
    return
  }

  savingVisibility.value = true
  errorMessage.value = ''

  try {
    await updateProblemVisibility({
      id: problemId.value,
      visibility: visibility.value,
    })
    toast.success('Problem visibility updated.')
    await loadProblemDetail(problemId.value)
  } catch (error) {
    const message = toAppError(error, 'Unable to update problem visibility.').message
    errorMessage.value = message
    toast.error(message)
  } finally {
    savingVisibility.value = false
  }
}

async function handleSubmit() {
  if (!selectedFile.value) {
    errorMessage.value = 'Please choose a problem zip file.'
    return
  }

  loading.value = true
  errorMessage.value = ''

  try {
    if (isEditMode.value && problemId.value) {
      await updateProblemByZip(problemId.value, selectedFile.value)
      toast.success('Problem update accepted.')
      await loadProblemDetail(problemId.value)
      return
    }

    const created = await createProblem(selectedFile.value)
    toast.success('Problem created.')
    await router.push(`/admin/problems/${created.id}/edit`)
  } catch (error) {
    const message = toAppError(error, 'Unable to save problem.').message
    errorMessage.value = message
    toast.error(message)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="admin-form-page" :aria-labelledby="isEditMode ? 'edit-problem-title' : 'new-problem-title'">
    <header class="admin-form-header">
      <div>
        <h2 :id="isEditMode ? 'edit-problem-title' : 'new-problem-title'" class="admin-title">
          {{ pageTitle }}
        </h2>
        <p class="admin-copy">
          Upload a complete problem zip package. The backend will parse and validate the package.
        </p>
      </div>

      <RouterLink class="admin-back-link" to="/admin/problems">Back to Problems</RouterLink>
    </header>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <div v-if="isEditMode" class="panel problem-summary">
      <span class="problem-summary__label">Current problem</span>
      <strong v-if="loadingDetail">Loading...</strong>
      <strong v-else>{{ detail?.name || `#${problemId}` }}</strong>
    </div>

    <section v-if="canManageVisibility" class="panel visibility-panel" aria-labelledby="problem-visibility-title">
      <div>
        <h3 id="problem-visibility-title" class="section-title">Visibility</h3>
      </div>

      <label class="select-field" for="problem-visibility">
        <span class="select-field__label">Visibility</span>
        <select
          id="problem-visibility"
          v-model="visibility"
          class="select-field__control"
          :disabled="loadingDetail || savingVisibility"
        >
          <option v-for="option in visibilityOptions" :key="option" :value="option">
            {{ PROBLEM_VISIBILITY_LABELS[option] }}
          </option>
        </select>
      </label>

      <div class="visibility-panel__actions">
        <BaseButton
          type="button"
          size="small"
          :loading="savingVisibility"
          :disabled="loadingDetail"
          @click="handleVisibilitySave"
        >
          Save Visibility
        </BaseButton>
      </div>
    </section>

    <form class="panel upload-form" @submit.prevent="handleSubmit">
      <div class="file-field">
        <span class="file-field__label">Problem zip file</span>
        <span class="file-picker">
          <input
            id="problem-zip"
            class="file-field__control"
            type="file"
            accept=".zip,application/zip,application/x-zip-compressed"
            required
            @change="handleFileChange"
          />
          <label class="file-picker__button" for="problem-zip">
            Choose File
          </label>
          <span class="file-picker__name">{{ selectedFile?.name || 'No file chosen' }}</span>
        </span>
      </div>

      <div class="upload-form__actions">
        <BaseButton type="submit" size="small" :loading="loading">
          {{ isEditMode ? 'Update Problem' : 'Create Problem' }}
        </BaseButton>
        <RouterLink class="admin-link" to="/admin/problems">Cancel</RouterLink>
      </div>
    </form>

    <section class="panel package-guide" aria-labelledby="problem-package-title">
      <div>
        <h3 id="problem-package-title" class="section-title">Problem Package Format</h3>
        <p class="guide-copy">
          Upload a zip package with these files at the zip root. Do not wrap them in an extra folder.
        </p>
      </div>

      <div class="guide-block">
        <h4 class="guide-block__title">Zip contents</h4>
        <pre class="guide-code"><code>config.yaml
statement.md
solution.md      optional
checker.cpp      required for special checker
input/
  1.in
  2.in
answer/
  1.ans
  2.ans</code></pre>
      </div>

      <div class="guide-block">
        <h4 class="guide-block__title">config.yaml</h4>
        <pre class="guide-code"><code>name: "Two Sum Problem"
time_limit: 1500
memory_limit: 256
checker: "wcmp"
difficulty: 1600
tags:
  - "sort"
  - "hash"</code></pre>
      </div>

      <ul class="guide-list">
        <li><code>config.yaml</code> must use <code>.yaml</code>, not <code>.yml</code>.</li>
        <li><code>statement.md</code> currently does not support images.</li>
        <li>Test files must start from <code>1.in</code> and <code>1.ans</code>, then stay continuous.</li>
        <li>Each <code>input/i.in</code> must have a matching <code>answer/i.ans</code>; missing either side is invalid.</li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.admin-form-page {
  display: grid;
  gap: 18px;
}

.admin-form-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.admin-title {
  margin: 0;
  color: var(--color-text);
  font-size: 22px;
  line-height: 1.25;
}

.admin-copy {
  max-width: 620px;
  margin: 6px 0 0;
  color: var(--color-text-muted);
  line-height: 1.55;
}

.admin-back-link,
.admin-link {
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
}

.admin-back-link:hover,
.admin-link:hover {
  color: var(--color-text);
  text-decoration: underline;
}

.problem-summary {
  display: grid;
  gap: 6px;
  padding: 16px;
}

.problem-summary__label {
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 650;
}

.upload-form,
.visibility-panel,
.package-guide {
  display: grid;
  gap: 18px;
  max-width: 640px;
  padding: 18px;
}

.section-title {
  margin: 0;
  color: var(--color-text);
  font-size: 17px;
  line-height: 1.3;
}

.file-field,
.select-field {
  display: grid;
  gap: 8px;
}

.file-field__label,
.select-field__label {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
}

.select-field__control {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
}

.select-field__control {
  min-height: 42px;
}

.select-field__control:focus {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
  outline: none;
}

.file-picker {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 38px;
}

.file-picker__button {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.file-picker__name {
  min-width: 0;
  overflow: hidden;
  color: var(--color-text-muted);
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-field__control {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.file-field__control:focus-visible + .file-picker__button {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.upload-form__actions,
.visibility-panel__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.guide-copy {
  margin: 6px 0 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.55;
}

.guide-block {
  display: grid;
  gap: 8px;
}

.guide-block__title {
  margin: 0;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 700;
}

.guide-code {
  overflow-x: auto;
  margin: 0;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background-muted);
  color: var(--color-text);
  font-size: 13px;
  line-height: 1.55;
}

.guide-code code,
.guide-list code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

.guide-list {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 18px;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.55;
}

.guide-list code {
  color: var(--color-text);
  font-size: 0.95em;
}

@media (max-width: 680px) {
  .admin-form-header {
    flex-direction: column;
  }
}
</style>
