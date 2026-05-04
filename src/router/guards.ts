import type { Router } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

export function installRouterGuards(router: Router) {
  router.beforeEach((to) => {
    const authStore = useAuthStore()

    if (!authStore.initialized) {
      authStore.restoreSession()
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      return {
        name: 'login',
        query: { redirect: to.fullPath },
      }
    }

    if (to.meta.requiresAdmin && !authStore.isAdmin) {
      return authStore.isAuthenticated
        ? { name: 'contests' }
        : { name: 'login', query: { redirect: to.fullPath } }
    }

    if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
      return authStore.isAuthenticated
        ? { name: 'admin-problems' }
        : { name: 'login', query: { redirect: to.fullPath } }
    }

    if (to.meta.guestOnly && authStore.isAuthenticated) {
      return { name: 'contests' }
    }

    return true
  })
}
