import { createRouter, createWebHistory } from 'vue-router'

import { installRouterGuards } from '@/router/guards'
import { routes } from '@/router/routes'

export const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

installRouterGuards(router)

