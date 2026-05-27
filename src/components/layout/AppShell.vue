<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from '@/components/layout/AppHeader.vue'
import ToastProvider from '@/components/feedback/ToastProvider.vue'

const route = useRoute()

const isFullscreen = computed(() => Boolean(route.meta.fullscreen))
</script>

<template>
  <div class="app-shell" :class="{ 'app-shell--fullscreen': isFullscreen }">
    <AppHeader v-if="!isFullscreen" />

    <main class="app-main">
      <RouterView />
    </main>

    <footer v-if="!isFullscreen" class="app-footer">© 2026 <span>TenJudge.</span> All rights reserved.</footer>
    <ToastProvider />
  </div>
</template>

<style scoped>
.app-shell {
  width: min(100% - 40px, 1120px);
  min-height: 100vh;
  margin: 0 auto;
  padding: 28px 0 24px;
}

.app-main {
  padding: 28px 0 36px;
}

.app-shell--fullscreen {
  width: 100%;
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
  padding: 0;
  overscroll-behavior: none;
}

.app-shell--fullscreen .app-main {
  height: 100dvh;
  min-height: 0;
  overflow: hidden;
  padding: 0;
  overscroll-behavior: none;
}

.app-footer {
  border-top: 1px solid var(--color-border);
  padding-top: 18px;
  color: #8a94a6;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.app-footer span {
  color: var(--color-text);
}

@media (max-width: 640px) {
  .app-shell {
    width: min(100% - 24px, 1120px);
    padding-top: 16px;
  }
}
</style>
