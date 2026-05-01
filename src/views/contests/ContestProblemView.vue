<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProblemStatement from '@/components/problem/ProblemStatement.vue'
import ProblemMeta from '@/components/problem/ProblemMeta.vue'
import CodeSubmitPanel from '@/components/problem/CodeSubmitPanel.vue'
import ContestInfoCard from '@/components/contest/ContestInfoCard.vue'
import { getContestDetail, getContestProblem } from '@/api/contests'
import { submitJudge } from '@/api/submissions'
import { getContestStatus } from '@/utils/contest'
import { toAppError } from '@/utils/error'
import type { ContestDetail } from '@/types/contest'
import type { ContestStatus } from '@/constants/contest'
import type { ProblemDetail } from '@/types/problem'
import type { SubmitLanguage } from '@/constants/languages'

// Submissions payload requires contestId for contest-context permission checks.
import { useToast } from '@/composables/useToast'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const contestId = computed(() => Number(route.params.contestId))
const problemIndex = computed(() => route.params.problemIndex as string)

const contest = ref<ContestDetail | null>(null)
const contestStatus = ref<ContestStatus | null>(null)
const problem = ref<ProblemDetail | null>(null)
const loading = ref(false)
const errorMessage = ref('')
const notStarted = ref(false)
const notStartedMessage = ref('')

async function load() {
  const cid = contestId.value
  const idx = problemIndex.value
  if (!cid || !idx) return

  loading.value = true
  errorMessage.value = ''
  notStarted.value = false
  notStartedMessage.value = ''

  try {
    const [detail, prob] = await Promise.all([
      getContestDetail(cid),
      getContestProblem(cid, idx),
    ])
    contest.value = detail
    contestStatus.value = getContestStatus({
      startTime: detail.startTime,
      endTime: detail.endTime,
    })
    problem.value = prob
  } catch (caught) {
    const appError = toAppError(caught, 'Failed to load contest problem.')
    errorMessage.value = appError.message

    if (
      appError.message.toLowerCase().includes('not started') ||
      appError.message.toLowerCase().includes('contest_not_started')
    ) {
      notStarted.value = true
      notStartedMessage.value = appError.message
    }
  } finally {
    loading.value = false
  }
}

watch(
  [() => contestId.value, () => problemIndex.value],
  () => {
    void load()
  },
  { immediate: true },
)

const submitLoading = ref(false)

async function handleSubmit(language: SubmitLanguage, code: string) {
  if (!problem.value) return
  submitLoading.value = true
  try {
    const result = await submitJudge({
      problemId: problem.value.id,
      contestId: contestId.value,
      language,
      code,
      isAgent: false,
    })
    toast.success(`Solution submitted successfully. Submission #${result.submissionId}`)
    router.push({ path: `/contests/${contestId.value}`, query: { tab: 'submissions' } })
  } catch (caught) {
    toast.error(toAppError(caught, 'Submission failed.').message)
  } finally {
    submitLoading.value = false
  }
}
</script>

<template>
  <section class="page" aria-labelledby="contest-problem-title">
    <div v-if="errorMessage && !notStarted" class="form-error">{{ errorMessage }}</div>

    <template v-if="!errorMessage || notStarted">
      <header class="page-header">
        <h1 id="contest-problem-title" class="page-title">
          {{ problem?.name || 'Contest Problem' }}
        </h1>
        <p v-if="contest" class="page-description">
          {{ contest.name }} &mdash; Problem {{ problemIndex }}
        </p>
      </header>

      <div class="problem-layout">
        <div class="problem-layout__main">
          <div v-if="loading" class="loading-area">
            <div class="skeleton-block" v-for="i in [1, 2, 3, 4]" :key="i">
              <span class="skeleton-line skeleton-line--wide" />
            </div>
          </div>

          <template v-else-if="notStarted">
            <div class="panel placeholder">
              <h2>Contest has not started</h2>
              <p>{{ notStartedMessage }}</p>
            </div>
          </template>

          <template v-else-if="problem">
            <ProblemStatement
              :statement="problem.statement"
              :solution="problem.solution"
            />

            <CodeSubmitPanel
              :loading="submitLoading"
              @submit="handleSubmit"
            />
          </template>
        </div>

        <aside v-if="problem" class="problem-layout__aside">
          <ContestInfoCard
            v-if="contest"
            :contest="contest"
            :status="contestStatus"
          />
          <ProblemMeta
            :difficulty="problem.difficulty"
            :tags="problem.tags"
            :time-limit="problem.timeLimit"
            :memory-limit="problem.memoryLimit"
          />
        </aside>
      </div>
    </template>
  </section>
</template>

<style scoped>
.problem-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 28px;
  align-items: start;
  margin-top: 22px;
}

.problem-layout__main {
  display: grid;
  gap: 0;
  min-width: 0;
}

.problem-layout__aside {
  display: grid;
  gap: 22px;
}

.loading-area {
  display: grid;
  gap: 12px;
}

.skeleton-block {
  padding: 12px 24px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
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

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@media (max-width: 860px) {
  .problem-layout {
    grid-template-columns: 1fr;
  }

  .problem-layout__aside {
    order: -1;
  }
}
</style>
