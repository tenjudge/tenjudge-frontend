export const SUBMIT_LANGUAGES = [
  { value: 'cpp', label: 'C++' },
  { value: 'python', label: 'Python' },
] as const

export type SubmitLanguage = (typeof SUBMIT_LANGUAGES)[number]['value']

