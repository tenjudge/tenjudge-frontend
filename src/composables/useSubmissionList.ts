import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getUserSubmissions } from '@/api/submissions'
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, PAGE_QUERY_KEYS } from '@/config/pagination'
import type { SubmissionListItem } from '@/types/submission'
import { toAppError } from '@/utils/error'

function parsePositiveInt(value: unknown, fallback: number): number {
  const candidate = Array.isArray(value) ? value[0] : value
  const parsed = Number(candidate)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export function useSubmissionList(userId: () => number | null) {
  const route = useRoute()
  const router = useRouter()

  const submissions = shallowRef<SubmissionListItem[]>([])
  const total = shallowRef(0)
  const pages = shallowRef(1)
  const loading = shallowRef(false)
  const errorMessage = shallowRef('')

  const currentPage = computed(() =>
    parsePositiveInt(route.query[PAGE_QUERY_KEYS.current], DEFAULT_PAGE),
  )

  watch(
    [() => currentPage.value, userId],
    () => {
      void loadSubmissions()
    },
    { immediate: true },
  )

  async function loadSubmissions() {
    const id = userId()
    if (id == null) {
      submissions.value = []
      total.value = 0
      pages.value = 1
      return
    }

    loading.value = true
    errorMessage.value = ''

    try {
      const result = await getUserSubmissions(id, {
        current: currentPage.value,
        size: DEFAULT_PAGE_SIZE,
      })

      submissions.value = result.records
      total.value = result.total
      pages.value = Math.max(result.pages || 1, 1)
    } catch (error) {
      errorMessage.value = toAppError(error, 'Unable to load submissions.').message
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

  return {
    submissions,
    total,
    pages,
    currentPage,
    loading,
    errorMessage,
    handlePageChange,
  }
}
