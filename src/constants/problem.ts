export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard' | 'Unknown'

export const PROBLEM_VISIBILITY_LABELS: Record<string, string> = {
  public: 'Public',
  private: 'Private',
}

export const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
  Unknown: '#94a3b8',
}

// Backend uses Codeforces-style difficulty ratings (e.g. 800, 1200, 2000).
export function getDifficultyLabel(score: number): DifficultyLevel {
  if (score <= 1200) return 'Easy'
  if (score <= 2000) return 'Medium'
  return 'Hard'
}

