<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { getAdminProblemPage, getMyAdminProblemPage } from '@/api/problems'
import BaseButton from '@/components/base/BaseButton.vue'
import BasePagination from '@/components/base/BasePagination.vue'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_QUERY_KEYS } from '@/config/pagination'
import { PROBLEM_VISIBILITY_LABELS } from '@/constants/problem'
import type { AdminProblemListItem } from '@/types/problem'
import { toAppError } from '@/utils/error'

type ProblemScope = 'all' | 'mine'

const route = useRoute()
const router = useRouter()

const problems = shallowRef<AdminProblemListItem[]>([])
const total = shallowRef(0)
const pages = shallowRef(1)
const loading = shallowRef(false)
const errorMessage = shallowRef('')

const currentPage = computed(() => parsePositiveInt(route.query[PAGE_QUERY_KEYS.current], DEFAULT_PAGE))
const scope = computed<ProblemScope>(() => (route.query.scope === 'mine' ? 'mine' : 'all'))
const showInitialSkeleton = computed(() => loading.value && problems.value.length === 0 && !errorMessage.value)

watch(
  () => [currentPage.value, scope.value],
  () => {
    void loadProblems()
  },
  { immediate: true },
)

function parsePositiveInt(value: unknown, fallback: number): number {
  const candidate = Array.isArray(value) ? value[0] : value
  const parsed = Number(candidate)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

async function loadProblems() {
  loading.value = true
  errorMessage.value = ''

  try {
    const query = {
      current: currentPage.value,
      size: DEFAULT_PAGE_SIZE,
      order: 'desc' as const,
    }
    const result = scope.value === 'mine'
      ? await getMyAdminProblemPage(query)
      : await getAdminProblemPage(query)

    problems.value = result.records
    total.value = result.total
    pages.value = Math.max(result.pages || 1, 1)
  } catch (error) {
    errorMessage.value = toAppError(error, 'Unable to load admin problems.').message
  } finally {
    loading.value = false
  }
}

async function setScope(nextScope: ProblemScope) {
  await router.replace({
    query: {
      ...route.query,
      scope: nextScope === 'mine' ? 'mine' : undefined,
      [PAGE_QUERY_KEYS.current]: undefined,
    },
  })
}

async function handlePageChange(page: number) {
  await router.replace({
    query: {
      ...route.query,
      [PAGE_QUERY_KEYS.current]: String(page),
    },
  })
}

function getVisibilityLabel(visibility: string) {
  return PROBLEM_VISIBILITY_LABELS[visibility] ?? visibility
}
</script>

<template>
  <section class="admin-section" aria-labelledby="admin-problems-title">
    <header class="admin-toolbar">
      <div>
        <h2 id="admin-problems-title" class="admin-title">Problems</h2>
      </div>

      <div class="admin-toolbar__actions">
        <div class="segmented-control" aria-label="Problem scope">
          <button
            class="segmented-control__button"
            :class="{ 'is-active': scope === 'all' }"
            type="button"
            @click="setScope('all')"
          >
            All Problems
          </button>
          <button
            class="segmented-control__button"
            :class="{ 'is-active': scope === 'mine' }"
            type="button"
            @click="setScope('mine')"
          >
            My Problems
          </button>
        </div>

        <BaseButton size="small" @click="router.push('/admin/problems/new')">New Problem</BaseButton>
      </div>
    </header>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <div v-if="!showInitialSkeleton && problems.length === 0" class="panel placeholder">
      <h2>No problems yet</h2>
      <p>No problem records were returned for the selected scope.</p>
    </div>

    <template v-else>
      <div class="admin-table-frame">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Visibility</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody v-if="showInitialSkeleton">
            <tr v-for="row in [1, 2, 3, 4, 5, 6, 7, 8]" :key="`problem-skeleton-${row}`">
              <td><span class="skeleton-line skeleton-line--short" /></td>
              <td><span class="skeleton-line skeleton-line--wide" /></td>
              <td><span class="skeleton-line skeleton-line--short" /></td>
              <td><span class="skeleton-line skeleton-line--short" /></td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="problem in problems" :key="problem.id">
              <td>{{ problem.id }}</td>
              <td class="admin-table__primary">{{ problem.name }}</td>
              <td>
                <span class="status-pill">{{ getVisibilityLabel(problem.visibility) }}</span>
              </td>
              <td>
                <RouterLink class="admin-action-link" :to="`/admin/problems/${problem.id}/edit`">
                  Edit
                </RouterLink>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <BasePagination
        :current="currentPage"
        :total="total"
        :pages="pages"
        :disabled="loading"
        @update:current="handlePageChange"
      />
    </template>
  </section>
</template>

<style scoped>
.admin-section {
  display: grid;
  gap: 18px;
}

.admin-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.admin-title {
  margin: 0;
  color: var(--color-text);
  font-size: 22px;
  line-height: 1.25;
}

.admin-toolbar__actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.segmented-control {
  display: inline-flex;
  overflow: hidden;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
}

.segmented-control__button {
  min-height: 32px;
  padding: 0 10px;
  border: 0;
  border-right: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.segmented-control__button:last-child {
  border-right: 0;
}

.segmented-control__button.is-active {
  background: var(--color-background-muted);
  color: var(--color-text);
}

.admin-table-frame {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.admin-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;
  table-layout: fixed;
}

.admin-table th,
.admin-table td {
  height: 40px;
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  font-size: 14px;
  text-align: center;
  vertical-align: middle;
}

.admin-table th:last-child,
.admin-table td:last-child {
  border-right: 0;
}

.admin-table tbody tr:last-child td {
  border-bottom: 0;
}

.admin-table tbody tr:nth-child(even) {
  background: var(--color-background-muted);
}

.admin-table th {
  background: #64748b;
  color: #ffffff;
  font-weight: 700;
}

.admin-table__primary {
  padding: 0 18px;
  font-weight: 650;
  text-align: left;
}

.admin-action-link {
  color: var(--color-focus);
  font-weight: 650;
  text-decoration: none;
}

.admin-action-link:hover {
  text-decoration: underline;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 9px;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  background: var(--color-surface);
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.skeleton-line {
  display: inline-flex;
  width: 70%;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #e9eef5 0%, #dce5f1 50%, #e9eef5 100%);
}

.skeleton-line--wide {
  width: 78%;
}

.skeleton-line--short {
  width: 46%;
}

@media (max-width: 720px) {
  .admin-toolbar,
  .admin-toolbar__actions {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
