<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const adminTabs = computed(() => [
  { label: 'Problems', to: '/admin/problems', visible: true },
  { label: 'Contests', to: '/admin/contests', visible: authStore.isSuperAdmin },
])
</script>

<template>
  <section class="page admin-page" aria-labelledby="admin-title">
    <header class="page-header">
      <h1 id="admin-title" class="page-title">Admin</h1>
    </header>

    <nav class="admin-subnav" aria-label="Admin navigation">
      <RouterLink
        v-for="tab in adminTabs.filter((item) => item.visible)"
        :key="tab.to"
        class="admin-subnav__link"
        active-class="admin-subnav__link--active"
        :to="tab.to"
      >
        {{ tab.label }}
      </RouterLink>
    </nav>

    <RouterView />
  </section>
</template>

<style scoped>
.admin-page {
  gap: 18px;
}

.admin-subnav {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
}

.admin-subnav__link {
  position: relative;
  padding: 10px 14px;
  color: var(--color-text-muted);
  font-size: 14px;
  font-weight: 650;
  text-decoration: none;
}

.admin-subnav__link:hover,
.admin-subnav__link--active {
  color: var(--color-text);
}

.admin-subnav__link--active::after {
  position: absolute;
  right: 12px;
  bottom: -1px;
  left: 12px;
  height: 2px;
  background: var(--color-text);
  content: '';
}
</style>
