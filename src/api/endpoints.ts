export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  problems: {
    list: '/problem',
    detail: (id: number) => `/problem/${id}`,
  },
  contests: {
    list: '/contest',
    detail: (contestId: number) => `/contest/${contestId}`,
    problem: (contestId: number, index: string) =>
      `/contest/${contestId}/problem/${encodeURIComponent(index)}`,
    register: '/contest/register',
  },
  submissions: {
    judge: '/submit/judge',
  },
} as const

