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
    component: () => import('@/views/submissions/SubmissionListView.vue'),
  },
  {
    path: '/submission/:submissionId',
    name: 'submission-detail',
    component: () => import('@/views/submissions/SubmissionDetailView.vue'),
  },
  {
    path: '/submissions/:userId',
    name: 'user-submissions',
    component: () => import('@/views/submissions/SubmissionListView.vue'),
  },
  {
    path: '/admin',
    component: () => import('@/views/admin/AdminLayoutView.vue'),
    meta: { requiresAdmin: true },
    children: [
      {
        path: '',
        redirect: { name: 'admin-problems' },
      },
      {
        path: 'problems',
        name: 'admin-problems',
        component: () => import('@/views/admin/AdminProblemListView.vue'),
      },
      {
        path: 'problems/new',
        name: 'admin-problem-new',
        component: () => import('@/views/admin/AdminProblemUploadView.vue'),
      },
      {
        path: 'problems/:problemId/edit',
        name: 'admin-problem-edit',
        component: () => import('@/views/admin/AdminProblemUploadView.vue'),
      },
      {
        path: 'contests',
        name: 'admin-contests',
        component: () => import('@/views/admin/AdminContestListView.vue'),
        meta: { requiresSuperAdmin: true },
      },
      {
        path: 'contests/new',
        name: 'admin-contest-new',
        component: () => import('@/views/admin/AdminContestEditView.vue'),
        meta: { requiresSuperAdmin: true },
      },
      {
        path: 'contests/:contestId/edit',
        name: 'admin-contest-edit',
        component: () => import('@/views/admin/AdminContestEditView.vue'),
        meta: { requiresSuperAdmin: true },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('@/views/admin/AdminUserManagementView.vue'),
        meta: { requiresSuperAdmin: true },
      },
    ],
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
