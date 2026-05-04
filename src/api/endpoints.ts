export const API_ENDPOINTS = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    logout: '/auth/logout',
  },
  problems: {
    list: '/problem',
    adminList: '/admin/problem',
    adminMine: '/admin/problem/mine',
    visibility: '/problem/visibility',
    detail: (id: number) => `/problem/${id}`,
  },
  contests: {
    list: '/contest',
    detail: (contestId: number) => `/contest/${contestId}`,
    problem: (contestId: number, index: string) =>
      `/contest/${contestId}/problem/${encodeURIComponent(index)}`,
    board: (contestId: number) => `/contest/${contestId}/board`,
    register: '/contest/register',
  },
  submissions: {
    judge: '/submit/judge',
    userList: (userId: number) => `/submit/user/${userId}`,
    contestUserList: (contestId: number, userId: number) =>
      `/submit/contest/${contestId}/user/${userId}`,
    detail: (submissionId: number) => `/submit/${submissionId}`,
  },
} as const
