<script setup lang="ts">
import { reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useAsyncState } from '@/composables/useAsyncState'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  username: '',
  email: '',
  password: '',
})

const { loading, error, run } = useAsyncState()

async function handleSubmit() {
  const result = await run(async () => {
    await authStore.register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    })
    return true
  }, 'Unable to create account.')

  if (result) {
    toast.success('Account created. You can now log in.')
    await router.push({
      path: '/auth/login',
      query: { account: form.username.trim() },
    })
    return
  }

  toast.error(error.value?.message ?? 'Unable to create account.')
}
</script>

<template>
  <section class="auth-page" aria-labelledby="register-title">
    <div class="auth-card">
      <header class="auth-card__header">
        <h1 id="register-title" class="auth-card__title">Create Account</h1>
        <p class="auth-card__copy">Register a regular user account for contests and practice.</p>
      </header>

      <form class="auth-card__form" @submit.prevent="handleSubmit">
        <BaseInput
          id="register-username"
          v-model="form.username"
          label="Username"
          autocomplete="username"
          required
        />
        <BaseInput
          id="register-email"
          v-model="form.email"
          label="Email"
          type="email"
          autocomplete="email"
          required
        />
        <BaseInput
          id="register-password"
          v-model="form.password"
          label="Password"
          type="password"
          autocomplete="new-password"
          required
        />

        <p v-if="error" class="form-error">{{ error.message }}</p>

        <BaseButton type="submit" :loading="loading">Create Account</BaseButton>
      </form>

      <p class="auth-card__footer">
        Already have an account?
        <RouterLink to="/auth/login">Login</RouterLink>
      </p>
    </div>
  </section>
</template>
