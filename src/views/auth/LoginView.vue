<script setup lang="ts">
import { computed, reactive, ref, watchEffect } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { toAppError } from '@/utils/error'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  account: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref('')

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
  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.login({
      account: form.account.trim(),
      password: form.password,
    })
    toast.success('Signed in successfully.')
    await router.push(redirectPath.value)
  } catch (error) {
    const appError = toAppError(error)
    errorMessage.value = appError.message
    toast.error(appError.message)
  } finally {
    loading.value = false
  }
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

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <BaseButton type="submit" :loading="loading">Login</BaseButton>
      </form>

      <p class="auth-card__footer">
        New to TenJudge?
        <RouterLink to="/auth/register">Create an account</RouterLink>
      </p>
    </div>
  </section>
</template>
