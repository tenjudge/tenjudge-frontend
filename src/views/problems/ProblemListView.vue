<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import BasePagination from '@/components/base/BasePagination.vue'
import { useProblemList } from '@/composables/useProblemList'
import { PROBLEM_TAGS } from '@/constants/tags'

const {
  problems,
  total,
  pages,
  currentPage,
  errorMessage,
  showInitialSkeleton,
  keyword,
  difficultyMin,
  difficultyMax,
  selectedTags,
  handlePageChange,
  resetFilters,
} = useProblemList()

const difficultyMinModel = computed({
  get: () => (difficultyMin.value !== null ? String(difficultyMin.value) : ''),
  set: (val: string) => {
    const n = parseInt(val, 10)
    difficultyMin.value = Number.isNaN(n) ? null : n
  },
})

const difficultyMaxModel = computed({
  get: () => (difficultyMax.value !== null ? String(difficultyMax.value) : ''),
  set: (val: string) => {
    const n = parseInt(val, 10)
    difficultyMax.value = Number.isNaN(n) ? null : n
  },
})

const tagsOpen = ref(false)
const tagsRef = ref<HTMLElement | null>(null)

function closeTags(e: MouseEvent) {
  if (tagsRef.value && !tagsRef.value.contains(e.target as Node)) {
    tagsOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', closeTags, true))
onUnmounted(() => document.removeEventListener('click', closeTags, true))

function toggleTag(tag: string) {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) {
    selectedTags.value = [...selectedTags.value, tag]
  } else {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag)
  }
}

</script>

<template>
  <section class="page" aria-labelledby="problems-title">
    <header class="page-header">
      <h1 id="problems-title" class="page-title">Problems</h1>
    </header>

    <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

    <div class="problems-layout">
      <div class="problems-layout__main">
        <div v-if="!showInitialSkeleton && problems.length === 0" class="panel placeholder">
          <h2>No problems yet</h2>
          <p>No problem records were returned for the current page.</p>
        </div>

        <template v-else>
          <div class="table-frame">
            <table class="problems-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Difficulty</th>
                </tr>
              </thead>
              <tbody v-if="showInitialSkeleton">
                <tr v-for="row in [1, 2, 3, 4, 5, 6, 7, 8]" :key="`skeleton-${row}`">
                  <td><span class="skeleton-line skeleton-line--narrow" /></td>
                  <td><span class="skeleton-line skeleton-line--wide" /></td>
                  <td><span class="skeleton-line skeleton-line--short" /></td>
                </tr>
              </tbody>
              <tbody v-else>
                <tr v-for="problem in problems" :key="problem.id">
                  <td class="problems-table__id">{{ problem.id }}</td>
                  <td class="problems-table__name">
                    <RouterLink :to="`/problems/${problem.id}`">{{ problem.name }}</RouterLink>
                  </td>
                  <td>{{ problem.difficulty }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="problems-pagination">
            <BasePagination
              :current="currentPage"
              :total="total"
              :pages="pages"
              :disabled="showInitialSkeleton"
              @update:current="handlePageChange"
            />
          </div>
        </template>
      </div>

      <aside class="problems-layout__aside">
        <div class="filter">
          <h2 class="filter__title">Filter</h2>

          <div class="filter__group">
            <label class="filter__label" for="filter-keyword">Search</label>
            <input
              id="filter-keyword"
              class="filter__input"
              type="text"
              placeholder="Problem name..."
              v-model="keyword"
            />
          </div>

          <div class="filter__group">
            <span class="filter__label">Difficulty range</span>
            <div class="filter__range">
              <input
                class="filter__input"
                type="number"
                placeholder="Min"
                v-model="difficultyMinModel"
              />
              <span class="filter__range-sep">&mdash;</span>
              <input
                class="filter__input"
                type="number"
                placeholder="Max"
                v-model="difficultyMaxModel"
              />
            </div>
          </div>

          <div class="filter__group">
            <span class="filter__label">Tags</span>
            <div ref="tagsRef" class="filter__tags">
              <div
                class="filter__tags-trigger"
                @click="tagsOpen = !tagsOpen"
              >
                <span v-if="selectedTags.length === 0" class="filter__tags-placeholder">Select tags...</span>
                <span v-else>{{ selectedTags.length }} selected</span>
                <span class="filter__tags-arrow" :class="{ 'is-open': tagsOpen }">
                  <svg width="10" height="6" viewBox="0 0 10 6">
                    <path d="M1 1l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none" />
                  </svg>
                </span>
              </div>
              <div v-if="tagsOpen" class="filter__tags-dropdown">
                <label
                  v-for="tag in PROBLEM_TAGS"
                  :key="tag"
                  class="filter__tags-option"
                >
                  <input
                    type="checkbox"
                    :checked="selectedTags.includes(tag)"
                    @change="toggleTag(tag)"
                  />
                  <span>{{ tag }}</span>
                </label>
              </div>
            </div>
          </div>

          <div class="filter__actions">
            <button class="filter__btn filter__btn--primary" type="button" @click="resetFilters">
              Apply
            </button>
            <button class="filter__btn filter__btn--secondary" type="button" @click="resetFilters">
              Reset
            </button>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>

<style scoped>
.problems-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 28px;
  align-items: start;
}

/* Table */

.table-frame {
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.table-frame {
  overflow-x: auto;
}

.problems-table {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
  table-layout: fixed;
}

.problems-table th,
.problems-table td {
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.problems-table th:last-child,
.problems-table td:last-child {
  border-right: 0;
}

.problems-table tbody tr:last-child td {
  border-bottom: 0;
}

.problems-table tbody tr:nth-child(even) {
  background: var(--color-background-muted);
}

.problems-table tbody tr:nth-child(odd) {
  background: var(--color-surface);
}

.problems-table th {
  height: 36px;
  background: #64748b;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
}

.problems-table td {
  height: 39px;
  padding: 0 24px;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 500;
}

.problems-table th:nth-child(1),
.problems-table td:nth-child(1) {
  width: 8%;
  text-align: center;
}

.problems-table th:nth-child(2) {
  width: 72%;
  text-align: center;
}

.problems-table td:nth-child(2) {
  width: 72%;
  text-align: center;
}

.problems-table th:nth-child(3),
.problems-table td:nth-child(3) {
  width: 20%;
  text-align: center;
}

.problems-table__id {
  color: var(--color-text-subtle);
  font-weight: 450;
}

.problems-table__name a {
  color: var(--color-text);
  font-weight: 650;
  text-decoration: none;
}

.problems-table__name a:hover {
  text-decoration: underline;
}

.problems-table__difficulty {
  font-weight: 650;
}

/* Skeleton */

.skeleton-line {
  display: block;
  height: 12px;
  margin: 0 auto;
  border-radius: 999px;
  background: linear-gradient(90deg, #edf2f7 0%, #f7f9fb 50%, #edf2f7 100%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.2s linear infinite;
}

.skeleton-line--wide {
  width: 86%;
}

.skeleton-line--narrow {
  width: 44%;
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

/* Pagination */

.problems-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

/* Filter */

.filter {
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.filter__title {
  margin: 0 0 14px;
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
}

.filter__group {
  margin-top: 12px;
}

.filter__label {
  display: block;
  margin-bottom: 5px;
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
}

.filter__input {
  width: 100%;
  min-height: 38px;
  padding: 0 10px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 14px;
  outline: none;
  -moz-appearance: textfield;
}

.filter__input::-webkit-inner-spin-button,
.filter__input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.filter__input:focus {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.filter__input::placeholder {
  color: #94a3b8;
}

.filter__range {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter__range-sep {
  color: var(--color-text-subtle);
  font-size: 14px;
  flex-shrink: 0;
}

.filter__tags {
  position: relative;
}

.filter__tags-trigger {
  display: flex;
  align-items: center;
  min-height: 38px;
  padding: 0 28px 0 10px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  cursor: pointer;
  position: relative;
}

.filter__tags-placeholder {
  color: #94a3b8;
  font-size: 14px;
}

.filter__tags-arrow {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  display: flex;
}

.filter__tags-arrow.is-open {
  transform: translateY(-50%) rotate(180deg);
}

.filter__tags-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 20;
  max-height: 200px;
  overflow-y: auto;
  margin-top: 2px;
  padding: 4px 0;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.filter__tags-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  font-size: 13px;
  color: var(--color-text);
  cursor: pointer;
}

.filter__tags-option:hover {
  background: #f1f5f9;
}

.filter__tags-option input[type="checkbox"] {
  accent-color: var(--color-focus);
}

.filter__actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}

.filter__btn {
  min-height: 36px;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 650;
  cursor: pointer;
}

.filter__btn--primary {
  border: 1px solid var(--color-text);
  background: var(--color-text);
  color: var(--color-surface);
}

.filter__btn--primary:hover {
  opacity: 0.88;
}

.filter__btn--secondary {
  border: 1px solid var(--color-border-strong);
  background: var(--color-surface);
  color: var(--color-text-subtle);
}

.filter__btn--secondary:hover {
  color: var(--color-text);
  border-color: var(--color-text-subtle);
}

/* Responsive */

@media (max-width: 860px) {
  .problems-layout {
    grid-template-columns: 1fr;
  }

  .problems-layout__aside {
    order: -1;
  }
}
</style>
