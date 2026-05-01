import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getProblemPage } from '@/api/problems'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_QUERY_KEYS } from '@/config/pagination'
import type { ProblemListItem } from '@/types/problem'
import { toAppError } from '@/utils/error'

function parsePositiveInt(value: unknown, fallback: number): number {
  const candidate = Array.isArray(value) ? value[0] : value
  const parsed = Number(candidate)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function useProblemList() {
  const route = useRoute()
  const router = useRouter()

  const problems = shallowRef<ProblemListItem[]>([])
  const total = shallowRef(0)
  const pages = shallowRef(1)
  const loading = shallowRef(false)
  const errorMessage = shallowRef('')

  const keyword = ref('')
  const difficultyMin = ref<number | null>(null)
  const difficultyMax = ref<number | null>(null)
  const selectedTags = ref<string[]>([])

  const currentPage = computed(() =>
    parsePositiveInt(route.query[PAGE_QUERY_KEYS.current], DEFAULT_PAGE),
  )

  const showInitialSkeleton = computed(
    () => loading.value && problems.value.length === 0 && !errorMessage.value,
  )

  watch(
    () => currentPage.value,
    () => {
      void loadProblems()
    },
    { immediate: true },
  )

  async function loadProblems() {
    loading.value = true
    errorMessage.value = ''

    try {
      const result = await getProblemPage({
        current: currentPage.value,
        size: DEFAULT_PAGE_SIZE,
      })

      problems.value = result.records
      total.value = result.total
      pages.value = Math.max(result.pages || 1, 1)
    } catch (error) {
      errorMessage.value = toAppError(error, 'Unable to load problems.').message
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

  function resetFilters() {
    keyword.value = ''
    difficultyMin.value = null
    difficultyMax.value = null
    selectedTags.value = []
  }

  return {
    problems,
    total,
    pages,
    currentPage,
    loading,
    errorMessage,
    showInitialSkeleton,
    keyword,
    difficultyMin,
    difficultyMax,
    selectedTags,
    handlePageChange,
    resetFilters,
  }
}
