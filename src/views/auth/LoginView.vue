<script setup lang="ts">
import { computed, reactive, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useAsyncState } from '@/composables/useAsyncState'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  account: '',
  password: '',
})

const { loading, error, run } = useAsyncState()

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/contests'
})

watchEffect(() => {
  const account = route.query.account

  if (typeof account === 'string' && account && !form.account) {
    form.account = account
  }
})

async function handleSubmit() {
  const result = await run(async () => {
    await authStore.login({
      account: form.account.trim(),
      password: form.password,
    })
    return true
  }, 'Unable to sign in.')

  if (result) {
    toast.success('Signed in successfully.')
    await router.push(redirectPath.value)
    return
  }

  toast.error(error.value?.message ?? 'Unable to sign in.')
}
</script>

<template>
  <section class="auth-page" aria-labelledby="login-title">
    <div class="auth-card">
      <header class="auth-card__header">
        <h1 id="login-title" class="auth-card__title">Login</h1>
        <p class="auth-card__copy">Use your username or email to continue.</p>
      </header>

      <form class="auth-card__form" @submit.prevent="handleSubmit">
        <BaseInput
          id="login-account"
          v-model="form.account"
          label="Username or email"
          autocomplete="username"
          required
        />
        <BaseInput
          id="login-password"
          v-model="form.password"
          label="Password"
          type="password"
          autocomplete="current-password"
          required
        />

        <p v-if="error" class="form-error">{{ error.message }}</p>

        <BaseButton type="submit" :loading="loading">Login</BaseButton>
      </form>

      <p class="auth-card__footer">
        New to TenJudge?
        <RouterLink to="/auth/register">Create an account</RouterLink>
      </p>
    </div>
  </section>
</template>
