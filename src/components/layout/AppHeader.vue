<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { APP_NAME } from '@/config/app'
import { useAuthStore } from '@/stores/auth'
import { useToast } from '@/composables/useToast'
import { toAppError } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const navItems = [
  { label: 'Contests', to: '/contests' },
  { label: 'Problems', to: '/problems' },
  { label: 'Submissions', to: '/submissions' },
  { label: 'Agent', to: '/agent' },
]

const loginTarget = computed(() => ({
  path: '/auth/login',
  query: route.fullPath.startsWith('/auth') ? undefined : { redirect: route.fullPath },
}))

async function handleLogout() {
  try {
    await authStore.logout()
    toast.success('You have signed out.')
    await router.push('/contests')
  } catch (error) {
    toast.error(toAppError(error).message)
  }
}
</script>

<template>
  <header class="app-header">
    <RouterLink class="brand" to="/contests" :aria-label="`${APP_NAME} home`">
      <span class="brand__mark" aria-hidden="true">TJ</span>
      <span>{{ APP_NAME }}</span>
    </RouterLink>

    <nav class="main-nav" aria-label="Main navigation">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        class="main-nav__link"
        active-class="main-nav__link--active"
        :to="item.to"
      >
        {{ item.label }}
      </RouterLink>
    </nav>

    <div class="account-nav">
      <template v-if="authStore.isAuthenticated">
        <span class="account-nav__user">{{ authStore.username }}</span>
        <button class="link-button" type="button" @click="handleLogout">Logout</button>
      </template>
      <template v-else>
        <RouterLink class="account-nav__link" :to="loginTarget">Login</RouterLink>
        <RouterLink class="account-nav__primary" to="/auth/register">Register</RouterLink>
      </template>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  display: grid;
  grid-template-columns: 190px 1fr minmax(180px, auto);
  align-items: center;
  min-height: 52px;
  padding: 0 16px;
  border: 1.75px solid var(--color-border-nav);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  width: fit-content;
  color: var(--color-text);
  font-size: 15px;
  font-weight: 750;
  text-decoration: none;
}

.brand__mark {
  display: grid;
  width: 28px;
  height: 28px;
  place-items: center;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  color: var(--color-text);
  font-size: 11px;
}

.main-nav {
  display: flex;
  justify-content: center;
  gap: 6px;
}

.main-nav__link,
.account-nav__link,
.account-nav__primary,
.link-button {
  border-radius: var(--radius-sm);
  color: var(--color-text-muted);
  font-size: 14px;
  line-height: 1;
  text-decoration: none;
}

.main-nav__link {
  padding: 8px 12px;
}

.main-nav__link--active {
  background: var(--color-background-muted);
  color: var(--color-text);
}

.account-nav {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  min-width: 0;
}

.account-nav__user {
  overflow: hidden;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.account-nav__primary {
  padding: 7px 11px;
  border: 1px solid var(--color-text);
  color: var(--color-text);
}

.link-button {
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.link-button:hover,
.account-nav__link:hover,
.main-nav__link:hover {
  color: var(--color-text);
}

@media (max-width: 760px) {
  .app-header {
    grid-template-columns: 1fr;
    gap: 10px;
    padding: 12px 14px;
  }

  .main-nav,
  .account-nav {
    justify-content: flex-start;
  }

  .main-nav {
    flex-wrap: wrap;
  }
}
</style>
