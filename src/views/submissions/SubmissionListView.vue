<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import BasePagination from '@/components/base/BasePagination.vue'
import SubmissionTable from '@/components/submission/SubmissionTable.vue'
import { useSubmissionList } from '@/composables/useSubmissionList'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const authStore = useAuthStore()

const routeUserId = computed(() => {
  const raw = route.params.userId
  if (raw == null) return null
  const parsed = Array.isArray(raw) ? Number(raw[0]) : Number(raw)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
})

const isOwnSubmissions = computed(() => routeUserId.value == null)

const effectiveUserId = computed(() => {
  if (isOwnSubmissions.value) {
    return authStore.userInfo?.id ?? null
  }
  return routeUserId.value
})

const {
  submissions,
  total,
  pages,
  currentPage,
  loading,
  errorMessage,
  handlePageChange,
} = useSubmissionList(() => effectiveUserId.value)

const pageTitle = computed(() => {
  if (isOwnSubmissions.value) return 'My Submissions'
  return `User #${routeUserId.value} Submissions`
})

const emptyText = computed(() => {
  if (errorMessage.value) return ''
  if (isOwnSubmissions.value) return 'You have no submissions yet.'
  return 'This user has no submissions yet.'
})

const loadingRows = Array.from({ length: 5 }, (_, i) => i)
</script>

<template>
  <section class="page" aria-labelledby="submissions-title">
    <header class="page-header">
      <h1 id="submissions-title" class="page-title">{{ pageTitle }}</h1>
    </header>

    <div v-if="!authStore.isAuthenticated && isOwnSubmissions" class="panel placeholder">
      <h2>Sign in required</h2>
      <p>
        <RouterLink to="/auth/login">Sign in</RouterLink>
        to view your submissions.
      </p>
    </div>

    <template v-else>
      <div v-if="errorMessage" class="form-error">{{ errorMessage }}</div>

      <div v-if="loading && submissions.length === 0 && !errorMessage" class="table-frame">
        <table class="submissions-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Problem</th>
              <th>Language</th>
              <th>Status</th>
              <th>Time</th>
              <th>Memory</th>
              <th>Submit Time</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="i in loadingRows" :key="i">
              <td v-for="j in 7" :key="j" class="skeleton-cell">
                <span class="skeleton-line" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <template v-else-if="!errorMessage">
        <template v-if="submissions.length === 0">
          <div class="panel placeholder">
            <h2>No submissions</h2>
            <p>{{ emptyText }}</p>
          </div>
        </template>

        <template v-else>
          <SubmissionTable
            :submissions="submissions"
            :get-problem-link="(item) => {
              const m = item.problemName?.match(/^#(\d+)\./)
              return m ? `/problems/${m[1]}` : null
            }"
          />

          <div v-if="pages > 1" class="pagination-wrapper">
            <BasePagination
              :current="currentPage"
              :total="total"
              :pages="pages"
              :disabled="loading"
              @update:current="handlePageChange"
            />
          </div>
        </template>
      </template>
    </template>
  </section>
</template>

<style scoped>
.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.table-frame {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
  overflow-x: auto;
}

.submissions-table {
  width: 100%;
  min-width: 700px;
  border-collapse: collapse;
}

.submissions-table th {
  height: 36px;
  background: #64748b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.submissions-table td {
  height: 39px;
  padding: 0 16px;
  vertical-align: middle;
}

.skeleton-cell {
  border-bottom: 1px solid var(--color-border);
}

.skeleton-line {
  display: block;
  height: 12px;
  border-radius: 999px;
  background: linear-gradient(90deg, #edf2f7 0%, #f7f9fb 50%, #edf2f7 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s linear infinite;
  max-width: 70%;
  margin: 0 auto;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
