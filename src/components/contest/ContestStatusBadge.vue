<script setup lang="ts">
import { computed } from 'vue'

import { CONTEST_STATUS_LABELS, type ContestStatus } from '@/constants/contest'

const props = defineProps<{
  status: ContestStatus
}>()

const label = computed(() => CONTEST_STATUS_LABELS[props.status])
</script>

<template>
  <span class="status-badge" :class="`status-badge--${status}`">
    {{ label }}
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
}

.status-badge--upcoming {
  background: rgba(37, 99, 235, 0.1);
  color: #1d4ed8;
}

.status-badge--running {
  background: rgba(22, 128, 60, 0.1);
  color: #166534;
}

.status-badge--ended {
  background: rgba(100, 116, 139, 0.12);
  color: #475569;
}
</style>

