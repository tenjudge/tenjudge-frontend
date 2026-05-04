<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { createContest, getContestDetail, updateContest } from '@/api/contests'
import BaseButton from '@/components/base/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import type { ContestDetail, ContestProblemInput } from '@/types/contest'
import { toAppError } from '@/utils/error'

interface ProblemRow {
  key: number
  problemId: string
  problemIndex: string
}

const route = useRoute()
const router = useRouter()
const toast = useToast()

const detail = shallowRef<ContestDetail | null>(null)
const loading = ref(false)
const saving = ref(false)
const errorMessage = ref('')

const name = ref('')
const startTime = ref('')
const endTime = ref('')
const freezeTime = ref('')
const penaltyPerWrong = ref('')
const problemRows = ref<ProblemRow[]>([])
let nextProblemRowKey = 1

const contestId = computed(() => {
  const raw = route.params.contestId
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
})
const isEditMode = computed(() => contestId.value !== null)
const pageTitle = computed(() => (isEditMode.value ? 'Edit Contest' : 'New Contest'))

watch(
  () => contestId.value,
  () => {
    resetForm()
    if (contestId.value) {
      void loadContest(contestId.value)
    }
  },
  { immediate: true },
)

function resetForm() {
  detail.value = null
  name.value = ''
  startTime.value = ''
  endTime.value = ''
  freezeTime.value = ''
  penaltyPerWrong.value = ''
  problemRows.value = []
  errorMessage.value = ''
}

async function loadContest(id: number) {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getContestDetail(id)
    detail.value = result
    name.value = result.name
    startTime.value = toDateTimeLocalValue(result.startTime)
    endTime.value = toDateTimeLocalValue(result.endTime)
    freezeTime.value = toDateTimeLocalValue(result.freezeTime)
    penaltyPerWrong.value = result.penaltyPerWrong === undefined ? '' : String(result.penaltyPerWrong)
    problemRows.value = result.problems.map((problem) => ({
      key: nextProblemRowKey++,
      problemId: String(problem.id),
      problemIndex: problem.index,
    }))
  } catch (error) {
    errorMessage.value = toAppError(error, 'Unable to load contest.').message
  } finally {
    loading.value = false
  }
}

function toDateTimeLocalValue(value?: string) {
  if (!value) {
    return ''
  }

  if (value.includes('T')) {
    return value.slice(0, 16)
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return ''
  }

  const pad = (n: number) => String(n).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function toApiDateTime(value: string) {
  return value.length === 16 ? `${value}:00` : value
}

function addProblemRow() {
  problemRows.value.push({
    key: nextProblemRowKey++,
    problemId: '',
    problemIndex: '',
  })
}

function removeProblemRow(key: number) {
  problemRows.value = problemRows.value.filter((row) => row.key !== key)
}

function buildContestProblems(): ContestProblemInput[] | null {
  const rows = problemRows.value.filter((row) => row.problemId.trim() || row.problemIndex.trim())
  const seenIds = new Set<number>()
  const seenIndexes = new Set<string>()
  const result: ContestProblemInput[] = []

  for (const row of rows) {
    const problemId = Number(row.problemId)
    const problemIndex = row.problemIndex.trim()

    if (!Number.isInteger(problemId) || problemId <= 0 || !problemIndex) {
      errorMessage.value = 'Each contest problem must include a valid problem ID and index.'
      return null
    }

    if (seenIds.has(problemId) || seenIndexes.has(problemIndex)) {
      errorMessage.value = 'Contest problem IDs and indexes must be unique.'
      return null
    }

    seenIds.add(problemId)
    seenIndexes.add(problemIndex)
    result.push({ problemId, problemIndex })
  }

  return result
}

async function handleSubmit() {
  errorMessage.value = ''

  if (!name.value.trim() || !startTime.value || !endTime.value) {
    errorMessage.value = 'Name, start time, and end time are required.'
    return
  }

  const penalty = penaltyPerWrong.value.trim()
  const penaltyValue = penalty === '' ? undefined : Number(penalty)

  if (penaltyValue !== undefined && (!Number.isInteger(penaltyValue) || penaltyValue < 0)) {
    errorMessage.value = 'Penalty per wrong must be a non-negative integer.'
    return
  }

  const basePayload = {
    name: name.value.trim(),
    startTime: toApiDateTime(startTime.value),
    endTime: toApiDateTime(endTime.value),
    freezeTime: freezeTime.value ? toApiDateTime(freezeTime.value) : undefined,
    penaltyPerWrong: penaltyValue,
  }

  saving.value = true

  try {
    if (isEditMode.value && contestId.value) {
      const contestProblems = buildContestProblems()
      if (contestProblems === null) {
        return
      }

      await updateContest({
        ...basePayload,
        contestId: contestId.value,
        contestProblems,
      })
      toast.success('Contest updated.')
      await loadContest(contestId.value)
      return
    }

    const created = await createContest(basePayload)
    toast.success('Contest created.')
    await router.push(`/admin/contests/${created.id}/edit`)
  } catch (error) {
    const message = toAppError(error, 'Unable to save contest.').message
    errorMessage.value = message
    toast.error(message)
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="admin-form-page" :aria-labelledby="isEditMode ? 'edit-contest-title' : 'new-contest-title'">
    <header class="admin-form-header">
      <div>
        <h2 :id="isEditMode ? 'edit-contest-title' : 'new-contest-title'" class="admin-title">
          {{ pageTitle }}
        </h2>
      </div>

      <RouterLink class="admin-back-link" to="/admin/contests">Back to Contests</RouterLink>
    </header>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <form class="contest-form" @submit.prevent="handleSubmit">
      <section class="panel form-panel" aria-labelledby="contest-basic-title">
        <h3 id="contest-basic-title" class="panel-title">Basic Information</h3>

        <label class="field" for="contest-name">
          <span class="field__label">Name</span>
          <input id="contest-name" v-model="name" class="field__control" type="text" required />
        </label>

        <div class="form-grid">
          <label class="field" for="contest-start">
            <span class="field__label">Start Time</span>
            <input id="contest-start" v-model="startTime" class="field__control" type="datetime-local" required />
          </label>

          <label class="field" for="contest-end">
            <span class="field__label">End Time</span>
            <input id="contest-end" v-model="endTime" class="field__control" type="datetime-local" required />
          </label>
        </div>

        <div class="form-grid">
          <label class="field" for="contest-freeze">
            <span class="field__label">Freeze Time</span>
            <input id="contest-freeze" v-model="freezeTime" class="field__control" type="datetime-local" />
          </label>

          <label class="field" for="contest-penalty">
            <span class="field__label">Penalty Per Wrong</span>
            <input
              id="contest-penalty"
              v-model="penaltyPerWrong"
              class="field__control"
              type="number"
              min="0"
              step="1"
              placeholder="0"
            />
          </label>
        </div>
      </section>

      <section class="panel form-panel" aria-labelledby="contest-problems-title">
        <div class="panel-title-row">
          <h3 id="contest-problems-title" class="panel-title">Problems</h3>
          <BaseButton v-if="isEditMode" type="button" variant="secondary" size="small" @click="addProblemRow">
            Add Problem
          </BaseButton>
        </div>

        <p v-if="!isEditMode" class="section-note">
          Save the contest first, then add contest problems on the edit page.
        </p>

        <div v-else-if="loading" class="section-note">Loading contest problems...</div>

        <div v-else class="problem-editor">
          <div v-if="problemRows.length === 0" class="empty-row">No contest problems configured.</div>

          <div v-for="row in problemRows" :key="row.key" class="problem-row">
            <label class="field field--compact">
              <span class="field__label">Index</span>
              <input v-model="row.problemIndex" class="field__control" type="text" maxlength="10" />
            </label>

            <label class="field field--compact">
              <span class="field__label">Problem ID</span>
              <input v-model="row.problemId" class="field__control" type="number" min="1" step="1" />
            </label>

            <BaseButton type="button" variant="ghost" size="small" @click="removeProblemRow(row.key)">
              Remove
            </BaseButton>
          </div>
        </div>
      </section>

      <div class="form-actions">
        <BaseButton type="submit" :loading="saving">
          {{ isEditMode ? 'Save Contest' : 'Create Contest' }}
        </BaseButton>
        <RouterLink class="admin-link" to="/admin/contests">Cancel</RouterLink>
      </div>
    </form>
  </section>
</template>

<style scoped>
.admin-form-page,
.contest-form {
  display: grid;
  gap: 18px;
}

.admin-form-header,
.panel-title-row,
.form-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.admin-title {
  margin: 0;
  color: var(--color-text);
  font-size: 22px;
  line-height: 1.25;
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

.form-panel {
  display: grid;
  gap: 16px;
  padding: 18px;
}

.panel-title {
  margin: 0;
  color: var(--color-text);
  font-size: 17px;
  line-height: 1.3;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field {
  display: grid;
  gap: 8px;
}

.field--compact {
  min-width: 0;
}

.field__label {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
}

.field__control {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
}

.field__control:focus {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.section-note,
.empty-row {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1.5;
}

.problem-editor {
  display: grid;
  gap: 10px;
}

.problem-row {
  display: grid;
  grid-template-columns: minmax(120px, 160px) minmax(160px, 1fr) auto;
  gap: 12px;
  align-items: end;
}

.form-actions {
  justify-content: flex-start;
}

@media (max-width: 720px) {
  .admin-form-header,
  .panel-title-row,
  .form-actions {
    align-items: flex-start;
    flex-direction: column;
  }

  .form-grid,
  .problem-row {
    grid-template-columns: 1fr;
  }
}
</style>
