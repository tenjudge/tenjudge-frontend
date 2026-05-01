import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/contests',
  },
  {
    path: '/auth/login',
    name: 'login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/auth/register',
    name: 'register',
    component: () => import('@/views/auth/RegisterView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/contests',
    name: 'contests',
    component: () => import('@/views/contests/ContestListView.vue'),
  },
  {
    path: '/contests/:contestId/register',
    name: 'contest-register',
    component: () => import('@/views/contests/ContestRegisterView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/contests/:contestId',
    name: 'contest-detail',
    component: () => import('@/views/contests/ContestDetailView.vue'),
  },
  {
    path: '/contests/:contestId/problems/:problemIndex',
    name: 'contest-problem',
    component: () => import('@/views/contests/ContestProblemView.vue'),
  },
  {
    path: '/problems',
    name: 'problems',
    component: () => import('@/views/problems/ProblemListView.vue'),
  },
  {
    path: '/problems/:problemId',
    name: 'problem-detail',
    component: () => import('@/views/problems/ProblemDetailView.vue'),
  },
  {
    path: '/submissions',
    name: 'submissions',
    component: () => import('@/views/submissions/SubmissionPlaceholderView.vue'),
  },
  {
    path: '/agent',
    name: 'agent',
    component: () => import('@/views/agent/AgentPlaceholderView.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/contests',
  },
]

