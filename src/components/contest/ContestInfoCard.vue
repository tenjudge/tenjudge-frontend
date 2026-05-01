<script setup lang="ts">
import ContestStatusBadge from '@/components/contest/ContestStatusBadge.vue'
import { formatDateTime } from '@/utils/datetime'
import type { ContestDetail } from '@/types/contest'
import type { ContestStatus } from '@/constants/contest'

defineProps<{
  contest: ContestDetail
  status: ContestStatus | null
}>()
</script>

<template>
  <div class="info-card">
    <h2 class="info-card__title">{{ contest.name }}</h2>

    <div class="info-card__status">
      <ContestStatusBadge v-if="status" :status="status" />
    </div>

    <dl class="info-card__list">
      <div class="info-card__item">
        <dt>Start</dt>
        <dd>{{ formatDateTime(contest.startTime) }}</dd>
      </div>
      <div class="info-card__item">
        <dt>End</dt>
        <dd>{{ formatDateTime(contest.endTime) }}</dd>
      </div>
      <div v-if="contest.freezeTime" class="info-card__item">
        <dt>Freeze</dt>
        <dd>{{ formatDateTime(contest.freezeTime) }}</dd>
      </div>
      <div v-if="contest.penaltyPerWrong" class="info-card__item">
        <dt>Penalty</dt>
        <dd>{{ contest.penaltyPerWrong }} min</dd>
      </div>
    </dl>
  </div>
</template>

<style scoped>
.info-card {
  display: grid;
  gap: 14px;
  padding: 20px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-surface);
}

.info-card__title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.3;
  word-break: break-word;
}

.info-card__status {
  display: flex;
}

.info-card__list {
  display: grid;
  gap: 10px;
  margin: 0;
}

.info-card__item {
  display: grid;
  gap: 2px;
}

.info-card__item dt {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-subtle);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.info-card__item dd {
  margin: 0;
  font-size: 14px;
  color: var(--color-text);
}
</style>
