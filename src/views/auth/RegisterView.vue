<script setup lang="ts">
import { reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import { useAuthStore } from '@/stores/auth'
import { toAppError } from '@/utils/error'

const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  username: '',
  email: '',
  password: '',
})

const loading = ref(false)
const errorMessage = ref('')

async function handleSubmit() {
  loading.value = true
  errorMessage.value = ''

  try {
    await authStore.register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    })
    toast.success('Account created. You can now log in.')
    await router.push({
      path: '/auth/login',
      query: { account: form.username.trim() },
    })
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

        <p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>

        <BaseButton type="submit" :loading="loading">Create Account</BaseButton>
      </form>

      <p class="auth-card__footer">
        Already have an account?
        <RouterLink to="/auth/login">Login</RouterLink>
      </p>
    </div>
  </section>
</template>

