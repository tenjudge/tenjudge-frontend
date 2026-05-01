<script setup lang="ts">
import { computed, ref, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getContestDetail, registerContest, unregisterContest } from '@/api/contests'
import ContestStatusBadge from '@/components/contest/ContestStatusBadge.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { getContestStatus } from '@/utils/contest'
import { formatDateTime } from '@/utils/datetime'
import { toAppError } from '@/utils/error'
import type { ContestDetail } from '@/types/contest'
import type { ContestStatus } from '@/constants/contest'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const contestId = computed(() => Number(route.params.contestId))
const contest = shallowRef<ContestDetail | null>(null)
const status = shallowRef<ContestStatus | null>(null)
const loading = shallowRef(false)
const pending = shallowRef(false)
const errorMessage = shallowRef('')
const apiFailed = shallowRef(false)

// Query params carry fallback data from the contest list page so the
// registration page still works when getContestDetail returns
// CONTEST_NOT_STARTED for upcoming contests.
const fallbackName = computed(() => (route.query.name as string) || '')
const fallbackStartTime = computed(() => (route.query.startTime as string) || '')
const fallbackEndTime = computed(() => (route.query.endTime as string) || '')
const registered = ref(route.query.registered === 'true')

watch(
  () => contestId.value,
  () => {
    void loadContest()
  },
  { immediate: true },
)

async function loadContest() {
  if (!contestId.value) return

  loading.value = true
  errorMessage.value = ''
  apiFailed.value = false

  try {
    const result = await getContestDetail(contestId.value)
    contest.value = result
    status.value = getContestStatus({
      startTime: result.startTime,
      endTime: result.endTime,
    })
  } catch (error) {
    const appError = toAppError(error, 'Unable to load contest details.')

    // For upcoming contests the detail API returns CONTEST_NOT_STARTED.
    // Fall back to query params so the user can still register.
    if (
      appError.message.toLowerCase().includes('not started') ||
      appError.message.toLowerCase().includes('contest_not_started')
    ) {
      apiFailed.value = true
      status.value = getContestStatus({
        startTime: fallbackStartTime.value,
        endTime: fallbackEndTime.value,
      })
    } else {
      errorMessage.value = appError.message
    }
  } finally {
    loading.value = false
  }
}

const contestName = computed(() => contest.value?.name || fallbackName.value || `Contest #${contestId.value}`)
const contestStartTime = computed(() => contest.value?.startTime || fallbackStartTime.value || '')
const contestEndTime = computed(() => contest.value?.endTime || fallbackEndTime.value || '')

const canRegister = computed(() => {
  if (!status.value) return false
  return status.value !== 'ended' && !registered.value
})

const canUnregister = computed(() => {
  return status.value === 'upcoming' && registered.value
})

const actionLabel = computed(() => {
  if (canRegister.value) return 'Register'
  if (canUnregister.value) return 'Unregister'
  if (registered.value && status.value === 'running') return 'Registered'
  if (status.value === 'ended') return 'Closed'
  return 'Registered'
})

async function handleAction() {
  if (!authStore.isAuthenticated) {
    toast.error('Please log in to manage contest registration.')
    await router.push({
      path: '/auth/login',
      query: { redirect: route.fullPath },
    })
    return
  }

  pending.value = true

  try {
    if (canRegister.value) {
      await registerContest(contestId.value)
      registered.value = true
      toast.success('Contest registration submitted.')
    } else if (canUnregister.value) {
      await unregisterContest(contestId.value)
      registered.value = false
      toast.success('Contest registration cancelled.')
    }
  } catch (error) {
    toast.error(toAppError(error).message)
  } finally {
    pending.value = false
  }
}

function goBack() {
  router.push('/contests')
}
</script>

<template>
  <section class="page" aria-labelledby="register-title">
    <div v-if="errorMessage" class="form-error">{{ errorMessage }}</div>

    <template v-if="!errorMessage">
      <header class="page-header">
        <h1 id="register-title" class="page-title">Register for Contest</h1>
      </header>

      <div v-if="loading" class="register-card panel">
        <div class="register-card__skeleton">
          <span class="skeleton-line skeleton-line--wide" />
          <span class="skeleton-line" />
          <span class="skeleton-line skeleton-line--short" />
        </div>
      </div>

      <div v-else class="register-card panel">
        <div class="register-card__header">
          <h2 class="register-card__name">{{ contestName }}</h2>
          <ContestStatusBadge v-if="status" :status="status" />
        </div>

        <p v-if="apiFailed" class="register-card__notice">
          This contest has not started yet. You can still register in advance.
        </p>

        <dl class="register-card__info">
          <div v-if="contestStartTime" class="register-card__item">
            <dt>Start Time</dt>
            <dd>{{ formatDateTime(contestStartTime) }}</dd>
          </div>
          <div v-if="contestEndTime" class="register-card__item">
            <dt>End Time</dt>
            <dd>{{ formatDateTime(contestEndTime) }}</dd>
          </div>
          <div class="register-card__item">
            <dt>Status</dt>
            <dd>{{ registered ? 'Registered' : 'Not registered' }}</dd>
          </div>
        </dl>

        <div class="register-card__actions">
          <BaseButton
            v-if="canRegister || canUnregister"
            :variant="canRegister ? 'primary' : 'secondary'"
            size="small"
            :loading="pending"
            @click="handleAction"
          >
            {{ actionLabel }}
          </BaseButton>
          <span v-else class="register-card__static">{{ actionLabel }}</span>
          <button class="register-card__back" type="button" @click="goBack">
            Back to contests
          </button>
        </div>
      </div>
    </template>
  </section>
</template>

<style scoped>
.register-card {
  display: grid;
  gap: 22px;
  padding: 28px;
  max-width: 520px;
}

.register-card__skeleton {
  display: grid;
  gap: 12px;
}

.register-card__header {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.register-card__name {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
}

.register-card__notice {
  margin: 0;
  padding: 10px 12px;
  border: 1px solid rgba(37, 99, 235, 0.3);
  border-radius: var(--radius-sm);
  background: rgba(37, 99, 235, 0.05);
  color: var(--color-focus);
  font-size: 14px;
}

.register-card__info {
  display: grid;
  gap: 10px;
  margin: 0;
}

.register-card__item {
  display: grid;
  gap: 2px;
}

.register-card__item dt {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.register-card__item dd {
  margin: 0;
  font-size: 14px;
  color: var(--color-text);
}

.register-card__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 6px;
}

.register-card__static {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-subtle);
}

.register-card__back {
  padding: 0;
  border: 0;
  background: none;
  color: var(--color-text-subtle);
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.register-card__back:hover {
  color: var(--color-text);
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

.skeleton-line--short {
  width: 36%;
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
