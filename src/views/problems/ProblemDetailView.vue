<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProblemStatement from '@/components/problem/ProblemStatement.vue'
import ProblemMeta from '@/components/problem/ProblemMeta.vue'
import CodeSubmitPanel from '@/components/problem/CodeSubmitPanel.vue'
import { getProblemDetail } from '@/api/problems'
import { submitJudge } from '@/api/submissions'
import { useAsyncState } from '@/composables/useAsyncState'
import { useToast } from '@/composables/useToast'
import { toAppError } from '@/utils/error'
import type { ProblemDetail } from '@/types/problem'
import type { SubmitLanguage } from '@/constants/languages'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { loading, error, run } = useAsyncState()

const problem = ref<ProblemDetail | null>(null)

const problemId = computed(() => Number(route.params.problemId))

watch(
  () => problemId.value,
  () => {
    void loadProblem()
  },
  { immediate: true },
)

async function loadProblem() {
  if (!problemId.value) return
  const result = await run(() => getProblemDetail(problemId.value), 'Failed to load problem.')
  if (result) {
    problem.value = result
  }
}

const submitLoading = ref(false)

async function handleSubmit(language: SubmitLanguage, code: string) {
  if (!problem.value) return
  submitLoading.value = true
  try {
    const result = await submitJudge({
      problemId: problem.value.id,
      language,
      code,
      isAgent: false,
    })
    toast.success(`Solution submitted successfully. Submission #${result.submissionId}`)
    router.push('/submissions')
  } catch (caught) {
    toast.error(toAppError(caught, 'Submission failed.').message)
  } finally {
    submitLoading.value = false
  }
}

function askAgent() {
  if (!problem.value) return
  router.push({
    name: 'agent',
    query: {
      redirect: route.fullPath,
      attach: `problem:${problem.value.id}`,
    },
  })
}
</script>

<template>
  <section class="page problem-detail-page" aria-labelledby="problem-detail-title">
    <div v-if="error" class="form-error page-error">{{ error.message }}</div>

    <template v-if="!error">
      <header class="page-header">
        <h1 v-if="problem" id="problem-detail-title" class="page-title">
          #{{ problem.id }}. {{ problem.name }}
        </h1>
      </header>

      <div class="problem-main">
        <div v-if="loading" class="loading-area">
          <div class="skeleton-block" v-for="i in [1, 2, 3, 4]" :key="i">
            <span class="skeleton-line skeleton-line--wide" />
          </div>
        </div>

        <template v-else-if="problem">
          <ProblemStatement
            :statement="problem.statement"
            :solution="problem.solution"
            back-to="/problems"
            back-label="Back to problems"
          />

          <CodeSubmitPanel
            :loading="submitLoading"
            @submit="handleSubmit"
          />
        </template>
      </div>

      <aside v-if="problem" class="problem-aside">
        <button class="ask-agent-button" type="button" @click="askAgent">
          Ask Agent
        </button>
        <ProblemMeta
          :difficulty="problem.difficulty"
          :tags="problem.tags"
          :time-limit="problem.timeLimit"
          :memory-limit="problem.memoryLimit"
        />
      </aside>
    </template>
  </section>
</template>

<style scoped>
.problem-detail-page {
  grid-template-columns: 1fr 280px;
  grid-template-areas:
    "header ."
    "main   aside";
  gap: 12px 28px;
  align-items: start;
}

.page-error {
  grid-column: 1 / -1;
}

.page-header {
  grid-area: header;
  text-align: center;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
}

.problem-main {
  grid-area: main;
  display: grid;
  gap: 0;
  min-width: 0;
}

.problem-aside {
  grid-area: aside;
  display: grid;
  gap: 22px;
}

.ask-agent-button {
  min-height: 38px;
  border: 1px solid var(--color-border-strong);
  border-radius: 4px;
  background: var(--color-text);
  color: var(--color-surface);
  font-weight: 700;
  cursor: pointer;
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
  .problem-detail-page {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "aside"
      "main";
  }

  .page-header {
    text-align: left;
  }
}
</style>
