<script setup lang="ts">
import { computed, shallowRef, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { getContestPage } from '@/api/contests'
import BaseButton from '@/components/base/BaseButton.vue'
import BasePagination from '@/components/base/BasePagination.vue'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_QUERY_KEYS } from '@/config/pagination'
import { CONTEST_STATUS_LABELS, type ContestStatus } from '@/constants/contest'
import type { ContestListItem } from '@/types/contest'
import { getContestStatus } from '@/utils/contest'
import { formatDateTime } from '@/utils/datetime'
import { toAppError } from '@/utils/error'

interface AdminContestRow extends ContestListItem {
  status: ContestStatus
  durationLabel: string
}

const route = useRoute()
const router = useRouter()

const contests = shallowRef<AdminContestRow[]>([])
const total = shallowRef(0)
const pages = shallowRef(1)
const loading = shallowRef(false)
const errorMessage = shallowRef('')

const currentPage = computed(() => parsePositiveInt(route.query[PAGE_QUERY_KEYS.current], DEFAULT_PAGE))
const showInitialSkeleton = computed(() => loading.value && contests.value.length === 0 && !errorMessage.value)

watch(
  () => currentPage.value,
  () => {
    void loadContests()
  },
  { immediate: true },
)

function parsePositiveInt(value: unknown, fallback: number): number {
  const candidate = Array.isArray(value) ? value[0] : value
  const parsed = Number(candidate)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

function getContestDurationLabel(contest: ContestListItem) {
  const start = new Date(contest.startTime).getTime()
  const end = new Date(contest.endTime).getTime()

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return '-'
  }

  const totalMinutes = Math.round((end - start) / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours > 0 && minutes > 0) {
    return `${hours}h ${minutes}m`
  }

  if (hours > 0) {
    return `${hours}h`
  }

  return `${minutes}m`
}

async function loadContests() {
  loading.value = true
  errorMessage.value = ''

  try {
    const result = await getContestPage({
      current: currentPage.value,
      size: DEFAULT_PAGE_SIZE,
    })

    contests.value = result.records.map((contest) => ({
      ...contest,
      status: getContestStatus(contest),
      durationLabel: getContestDurationLabel(contest),
    }))
    total.value = result.total
    pages.value = Math.max(result.pages || 1, 1)
  } catch (error) {
    errorMessage.value = toAppError(error, 'Unable to load contests.').message
  } finally {
    loading.value = false
  }
}

async function handlePageChange(page: number) {
  await router.replace({
    query: {
      ...route.query,
      [PAGE_QUERY_KEYS.current]: String(page),
    },
  })
}
</script>

<template>
  <section class="admin-section" aria-labelledby="admin-contests-title">
    <header class="admin-toolbar">
      <h2 id="admin-contests-title" class="admin-title">Contests</h2>
      <BaseButton size="small" @click="router.push('/admin/contests/new')">New Contest</BaseButton>
    </header>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <div v-if="!showInitialSkeleton && contests.length === 0" class="panel placeholder">
      <h2>No contests yet</h2>
      <p>No contest records were returned for the current page.</p>
    </div>

    <template v-else>
      <div class="admin-table-frame">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Start Time</th>
              <th>Duration</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody v-if="showInitialSkeleton">
            <tr v-for="row in [1, 2, 3, 4, 5, 6]" :key="`contest-skeleton-${row}`">
              <td><span class="skeleton-line skeleton-line--wide" /></td>
              <td><span class="skeleton-line" /></td>
              <td><span class="skeleton-line skeleton-line--short" /></td>
              <td><span class="skeleton-line skeleton-line--short" /></td>
              <td><span class="skeleton-line skeleton-line--short" /></td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr v-for="contest in contests" :key="contest.id">
              <td class="admin-table__primary">{{ contest.name }}</td>
              <td>{{ formatDateTime(contest.startTime) }}</td>
              <td>{{ contest.durationLabel }}</td>
              <td>{{ CONTEST_STATUS_LABELS[contest.status] }}</td>
              <td>
                <RouterLink class="admin-action-link" :to="`/admin/contests/${contest.id}/edit`">
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

.admin-table-frame {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.admin-table {
  width: 100%;
  min-width: 880px;
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

@media (max-width: 680px) {
  .admin-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }
}
</style>
