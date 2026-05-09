<script setup lang="ts">
import type {
  ContestBoardListItem,
  ContestBoardProblem,
  ContestProblemResult,
} from '@/types/contest'

defineProps<{
  contestId: number
  problems: ContestBoardProblem[]
  rows: ContestBoardListItem[]
}>()

function resultFor(row: ContestBoardListItem, problem: ContestBoardProblem) {
  return row.problemResults?.[String(problem.problemId)]
}

function getFrozenAttempts(result: ContestProblemResult | undefined) {
  const attempts = result?.attemptsAfterFreeze
  return typeof attempts === 'number' && Number.isFinite(attempts) && attempts > 0
    ? Math.floor(attempts)
    : 0
}

function getCellClass(result: ContestProblemResult | undefined) {
  if (!result) return ''
  if (getFrozenAttempts(result) > 0) return 'is-frozen'
  if (result.accepted) return 'is-accepted'
  if (result.wrongAttemptsBeforeAc > 0) return 'is-rejected'
  return ''
}

function getCellText(result: ContestProblemResult | undefined) {
  if (!result) return ''

  const frozenAttempts = getFrozenAttempts(result)
  if (frozenAttempts > 0) {
    return `?${frozenAttempts}`
  }

  const wrongAttempts = result.wrongAttemptsBeforeAc
  if (result.accepted) {
    return wrongAttempts > 0 ? `+${wrongAttempts}` : '+'
  }

  return wrongAttempts > 0 ? `-${wrongAttempts}` : ''
}

function shouldShowAcceptedAt(result: ContestProblemResult | undefined) {
  return Boolean(result?.accepted && getFrozenAttempts(result) === 0)
}

function formatAcceptedAt(minutes: number) {
  const normalizedMinutes = Number.isFinite(minutes) && minutes > 0 ? Math.floor(minutes) : 0
  const hours = Math.floor(normalizedMinutes / 60)
  const restMinutes = normalizedMinutes % 60
  return `${hours}:${String(restMinutes).padStart(2, '0')}`
}
</script>

<template>
  <div class="table-frame standings-frame">
    <table
      class="standings-table"
      :style="{ '--problem-count': problems.length }"
    >
      <colgroup>
        <col class="standings-table__rank-col">
        <col class="standings-table__user-col">
        <col class="standings-table__solved-col">
        <col class="standings-table__penalty-col">
        <col
          v-for="problem in problems"
          :key="problem.problemId"
          class="standings-table__problem-col"
        >
      </colgroup>
      <thead>
        <tr>
          <th>Rank</th>
          <th>User</th>
          <th>Solved</th>
          <th>Penalty</th>
          <th
            v-for="problem in problems"
            :key="problem.problemId"
            class="standings-table__problem-head"
          >
            <RouterLink :to="`/contests/${contestId}/problems/${problem.problemIndex}`">
              {{ problem.problemIndex }}
            </RouterLink>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.userId">
          <td class="standings-table__rank">{{ row.rank }}</td>
          <td class="standings-table__user">
            <RouterLink
              :to="{
                path: `/contests/${contestId}`,
                query: {
                  tab: 'submissions',
                  userId: String(row.userId),
                  username: row.username,
                },
              }"
            >
              {{ row.username }}
            </RouterLink>
          </td>
          <td class="standings-table__metric">{{ row.solvedCount }}</td>
          <td class="standings-table__metric">{{ row.penalty }}</td>
          <td
            v-for="problem in problems"
            :key="problem.problemId"
            class="standings-table__problem-cell"
            :class="getCellClass(resultFor(row, problem))"
          >
            <span class="standings-table__result">
              {{ getCellText(resultFor(row, problem)) }}
            </span>
            <span
              v-if="shouldShowAcceptedAt(resultFor(row, problem))"
              class="standings-table__accepted-time"
            >
              {{ formatAcceptedAt(resultFor(row, problem)!.acceptedAt) }}
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.standings-frame {
  overflow-x: auto;
}

.standings-table {
  width: 100%;
  min-width: calc(484px + var(--problem-count) * 58px);
  border-collapse: collapse;
  table-layout: fixed;
}

.standings-table__rank-col {
  width: 72px;
}

.standings-table__solved-col {
  width: 72px;
}

.standings-table__penalty-col {
  width: 80px;
}

.standings-table__problem-col {
  width: 58px;
}

.standings-table th,
.standings-table td {
  border-right: 1px solid var(--color-border);
  border-bottom: 1px solid var(--color-border);
  vertical-align: middle;
}

.standings-table th:last-child,
.standings-table td:last-child {
  border-right: 0;
}

.standings-table tbody tr:last-child td {
  border-bottom: 0;
}

.standings-table tbody tr:nth-child(even) {
  background: var(--color-background-muted);
}

.standings-table tbody tr:nth-child(odd) {
  background: var(--color-surface);
}

.standings-table th {
  height: 36px;
  background: #64748b;
  color: #ffffff;
  font-size: 13px;
  font-weight: 700;
  text-align: center;
}

.standings-table td {
  height: 48px;
  padding: 0 10px;
  color: var(--color-text);
  font-size: 14px;
}

.standings-table__rank,
.standings-table__metric,
.standings-table__problem-cell {
  text-align: center;
  font-weight: 650;
}

.standings-table__user {
  min-width: 180px;
  text-align: center;
}

.standings-table__user a {
  display: block;
  overflow: hidden;
  color: var(--color-text);
  font-weight: 650;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.standings-table__user a:hover {
  text-decoration: underline;
}

.standings-table__problem-head,
.standings-table__problem-cell {
  padding: 0 4px;
}

.standings-table__problem-head a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  min-height: 28px;
  color: #ffffff;
  text-decoration: none;
}

.standings-table__problem-head a:hover {
  text-decoration: underline;
}

.standings-table__problem-cell {
  line-height: 1.2;
}

.standings-table__result,
.standings-table__accepted-time {
  display: block;
}

.standings-table__accepted-time {
  margin-top: 2px;
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-muted);
}

.standings-table__problem-cell.is-accepted {
  background: color-mix(in srgb, var(--color-success) 12%, var(--color-surface));
  color: var(--color-success);
}

.standings-table__problem-cell.is-rejected {
  background: color-mix(in srgb, var(--color-danger) 12%, var(--color-surface));
  color: var(--color-danger);
}

.standings-table__problem-cell.is-frozen {
  background: color-mix(in srgb, var(--color-focus) 12%, var(--color-surface));
  color: var(--color-focus);
}
</style>
