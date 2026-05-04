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
      <label class="file-field" for="problem-zip">
        <span class="file-field__label">Problem zip file</span>
        <input
          id="problem-zip"
          class="file-field__control"
          type="file"
          accept=".zip,application/zip,application/x-zip-compressed"
          required
          @change="handleFileChange"
        />
      </label>

      <div class="upload-form__actions">
        <BaseButton type="submit" :loading="loading">
          {{ isEditMode ? 'Update Problem' : 'Create Problem' }}
        </BaseButton>
        <RouterLink class="admin-link" to="/admin/problems">Cancel</RouterLink>
      </div>
    </form>
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
.visibility-panel {
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

.file-field__control,
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

.file-field__control:focus,
.select-field__control:focus {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
  outline: none;
}

.upload-form__actions,
.visibility-panel__actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

@media (max-width: 680px) {
  .admin-form-header {
    flex-direction: column;
  }
}
</style>
