import { shallowRef, onUnmounted } from 'vue'

interface PollingOptions {
  fastInterval?: number
  slowInterval?: number
  fastRounds?: number
  maxRounds?: number
}

export function useSubmissionPolling(options: PollingOptions = {}) {
  const {
    fastInterval = 1000,
    slowInterval = 2000,
    fastRounds = 5,
    maxRounds = 10,
  } = options

  const isPolling = shallowRef(false)
  let round = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  function start(fetchFn: () => Promise<void>, hasPending: () => boolean) {
    if (isPolling.value) return
    if (!hasPending()) return

    isPolling.value = true
    round = 0
    scheduleNext(fetchFn, hasPending)
  }

  function stop() {
    isPolling.value = false
    if (timer !== null) {
      clearTimeout(timer)
      timer = null
    }
  }

  function scheduleNext(
    fetchFn: () => Promise<void>,
    hasPending: () => boolean,
  ) {
    if (round >= maxRounds) {
      stop()
      return
    }

    const delay = round < fastRounds ? fastInterval : slowInterval

    timer = setTimeout(async () => {
      round++
      try {
        await fetchFn()
      } catch {
        // Continue polling on individual request failure
      }

      if (!hasPending()) {
        stop()
        return
      }
      scheduleNext(fetchFn, hasPending)
    }, delay)
  }

  onUnmounted(stop)

  return { isPolling, start, stop }
}
