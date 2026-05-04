<script setup lang="ts">
import { computed, ref, shallowRef } from 'vue'

import { adminRegister, getPublicUser, updateUserRole } from '@/api/auth'
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { useToast } from '@/composables/useToast'
import {
  USER_ROLE_LABELS,
  USER_ROLE_OPTIONS,
  USER_ROLES,
  type UserRole,
} from '@/constants/user'
import { useAuthStore } from '@/stores/auth'
import type { User } from '@/types/auth'
import { formatDateTime } from '@/utils/datetime'
import { toAppError } from '@/utils/error'

type SearchMode = 'userId' | 'username'

const toast = useToast()
const authStore = useAuthStore()

const searchMode = ref<SearchMode>('userId')
const searchValue = ref('')
const searching = ref(false)
const searchError = ref('')
const searchedUser = shallowRef<User | null>(null)
const selectedRole = ref<UserRole>(USER_ROLES.user)
const savingRole = ref(false)

const createForm = ref({
  username: '',
  email: '',
  password: '',
  role: USER_ROLES.user as UserRole,
})
const creating = ref(false)
const createError = ref('')
const lastCreatedId = ref<number | null>(null)

const isOwnUser = computed(() => {
  return Boolean(authStore.userInfo?.id && searchedUser.value?.id === authStore.userInfo.id)
})

const roleChanged = computed(() => {
  return Boolean(searchedUser.value && selectedRole.value !== searchedUser.value.role)
})

const canSaveRole = computed(() => {
  return Boolean(searchedUser.value && roleChanged.value && !isOwnUser.value)
})

function isUserRole(value: string): value is UserRole {
  return Object.values(USER_ROLES).includes(value as UserRole)
}

function normalizeUserRole(value: string): UserRole {
  return isUserRole(value) ? value : USER_ROLES.user
}

function getRoleLabel(role?: string | null): string {
  return role && isUserRole(role) ? USER_ROLE_LABELS[role] : role || '-'
}

function displayNumber(value?: number): string {
  return typeof value === 'number' ? String(value) : '-'
}

function resetSearchResult() {
  searchedUser.value = null
  selectedRole.value = USER_ROLES.user
}

async function handleSearch() {
  searchError.value = ''
  resetSearchResult()

  const rawValue = searchValue.value.trim()

  if (!rawValue) {
    searchError.value = searchMode.value === 'userId'
      ? 'User ID is required.'
      : 'Username is required.'
    return
  }

  let query: { userId: number } | { username: string }

  if (searchMode.value === 'userId') {
    const userId = Number(rawValue)
    if (!Number.isInteger(userId) || userId <= 0) {
      searchError.value = 'User ID must be a positive integer.'
      return
    }
    query = { userId }
  } else {
    query = { username: rawValue }
  }

  searching.value = true

  try {
    const result = await getPublicUser(query)
    searchedUser.value = result
    selectedRole.value = normalizeUserRole(result.role)
  } catch (error) {
    const message = toAppError(error, 'Unable to find user.').message
    searchError.value = message
    toast.error(message)
  } finally {
    searching.value = false
  }
}

async function handleRoleSave() {
  if (!searchedUser.value || !canSaveRole.value) {
    return
  }

  savingRole.value = true
  searchError.value = ''

  try {
    await updateUserRole({
      userId: searchedUser.value.id,
      role: selectedRole.value,
    })
    searchedUser.value = {
      ...searchedUser.value,
      role: selectedRole.value,
    }
    toast.success('User role updated.')
  } catch (error) {
    const message = toAppError(error, 'Unable to update user role.').message
    searchError.value = message
    toast.error(message)
  } finally {
    savingRole.value = false
  }
}

function resetCreateForm() {
  createForm.value = {
    username: '',
    email: '',
    password: '',
    role: USER_ROLES.user,
  }
}

async function handleCreate() {
  createError.value = ''
  lastCreatedId.value = null

  const username = createForm.value.username.trim()
  const email = createForm.value.email.trim()
  const password = createForm.value.password

  if (!username || !email || !password) {
    createError.value = 'Username, email, and password are required.'
    return
  }

  creating.value = true

  try {
    const created = await adminRegister({
      username,
      email,
      password,
      role: createForm.value.role,
    })
    lastCreatedId.value = created.id
    resetCreateForm()
    toast.success('User created.')
  } catch (error) {
    const message = toAppError(error, 'Unable to create user.').message
    createError.value = message
    toast.error(message)
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <section class="admin-section" aria-labelledby="admin-users-title">
    <header class="admin-toolbar">
      <div>
        <h2 id="admin-users-title" class="admin-title">Users</h2>
      </div>
    </header>

    <div class="admin-user-grid">
      <section class="panel form-panel" aria-labelledby="user-search-title">
        <h3 id="user-search-title" class="panel-title">Find User</h3>

        <p v-if="searchError" class="form-error">{{ searchError }}</p>

        <form class="user-form" @submit.prevent="handleSearch">
          <div class="form-grid form-grid--search">
            <label class="field" for="user-search-mode">
              <span class="field__label">Search By</span>
              <select id="user-search-mode" v-model="searchMode" class="field__control">
                <option value="userId">User ID</option>
                <option value="username">Username</option>
              </select>
            </label>

            <BaseInput
              id="user-search-value"
              v-model="searchValue"
              :label="searchMode === 'userId' ? 'User ID' : 'Username'"
              :autocomplete="searchMode === 'username' ? 'username' : undefined"
              required
            />
          </div>

          <div class="form-actions">
            <BaseButton type="submit" :loading="searching">Search</BaseButton>
          </div>
        </form>

        <article v-if="searchedUser" class="user-card" aria-labelledby="found-user-title">
          <div class="user-card__header">
            <div>
              <h4 id="found-user-title" class="user-card__title">{{ searchedUser.username }}</h4>
              <p class="user-card__meta">#{{ searchedUser.id }}</p>
            </div>
            <span class="role-pill">{{ getRoleLabel(searchedUser.role) }}</span>
          </div>

          <dl class="user-details">
            <div>
              <dt>Rating</dt>
              <dd>{{ displayNumber(searchedUser.rating) }}</dd>
            </div>
            <div>
              <dt>Max Rating</dt>
              <dd>{{ displayNumber(searchedUser.maxRating) }}</dd>
            </div>
            <div>
              <dt>Solved</dt>
              <dd>{{ displayNumber(searchedUser.solvedCount) }}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{{ formatDateTime(searchedUser.createdAt) }}</dd>
            </div>
          </dl>

          <form class="role-form" @submit.prevent="handleRoleSave">
            <label class="field" for="found-user-role">
              <span class="field__label">Role</span>
              <select
                id="found-user-role"
                v-model="selectedRole"
                class="field__control"
                :disabled="savingRole || isOwnUser"
              >
                <option v-for="option in USER_ROLE_OPTIONS" :key="option.value" :value="option.value">
                  {{ option.label }}
                </option>
              </select>
            </label>

            <p v-if="isOwnUser" class="section-note">You cannot change your own role.</p>

            <div class="form-actions">
              <BaseButton type="submit" :loading="savingRole" :disabled="!canSaveRole">
                Save Role
              </BaseButton>
            </div>
          </form>
        </article>
      </section>

      <section class="panel form-panel" aria-labelledby="user-create-title">
        <h3 id="user-create-title" class="panel-title">Create User</h3>

        <p v-if="createError" class="form-error">{{ createError }}</p>
        <p v-else-if="lastCreatedId" class="form-success">Created user #{{ lastCreatedId }}.</p>

        <form class="user-form" @submit.prevent="handleCreate">
          <BaseInput
            id="create-username"
            v-model="createForm.username"
            label="Username"
            autocomplete="username"
            required
          />
          <BaseInput
            id="create-email"
            v-model="createForm.email"
            label="Email"
            type="email"
            autocomplete="email"
            required
          />
          <BaseInput
            id="create-password"
            v-model="createForm.password"
            label="Password"
            type="password"
            autocomplete="new-password"
            required
          />

          <label class="field" for="create-role">
            <span class="field__label">Role</span>
            <select id="create-role" v-model="createForm.role" class="field__control">
              <option v-for="option in USER_ROLE_OPTIONS" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>

          <div class="form-actions">
            <BaseButton type="submit" :loading="creating">Create User</BaseButton>
          </div>
        </form>
      </section>
    </div>
  </section>
</template>

<style scoped>
.admin-section {
  display: grid;
  gap: 18px;
}

.admin-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.admin-title {
  margin: 0;
  color: var(--color-text);
  font-size: 22px;
  line-height: 1.25;
}

.admin-user-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 18px;
  align-items: start;
}

.form-panel,
.user-form,
.role-form {
  display: grid;
  gap: 16px;
}

.form-panel {
  padding: 18px;
}

.panel-title {
  margin: 0;
  color: var(--color-text);
  font-size: 17px;
  line-height: 1.3;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.form-grid--search {
  grid-template-columns: minmax(140px, 0.35fr) minmax(0, 1fr);
}

.field {
  display: grid;
  gap: 8px;
}

.field__label {
  color: var(--color-text);
  font-size: 13px;
  font-weight: 650;
}

.field__control {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  outline: none;
}

.field__control:disabled {
  background: var(--color-background-muted);
  cursor: not-allowed;
  opacity: 0.72;
}

.field__control:focus {
  border-color: var(--color-focus);
  box-shadow: 0 0 0 3px var(--color-focus-ring);
}

.form-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
}

.form-success {
  margin: 0;
  color: var(--color-success);
  font-size: 14px;
  font-weight: 650;
}

.section-note {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 14px;
}

.user-card {
  display: grid;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.user-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.user-card__title {
  margin: 0;
  color: var(--color-text);
  font-size: 18px;
  line-height: 1.3;
}

.user-card__meta {
  margin: 4px 0 0;
  color: var(--color-text-muted);
  font-size: 13px;
}

.role-pill {
  display: inline-flex;
  align-items: center;
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-background-muted);
  color: var(--color-text);
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.user-details {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.user-details div {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
}

.user-details dt {
  color: var(--color-text-muted);
  font-size: 12px;
  font-weight: 650;
}

.user-details dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--color-text);
  font-size: 14px;
  font-weight: 650;
}

@media (max-width: 860px) {
  .admin-user-grid,
  .form-grid,
  .form-grid--search,
  .user-details {
    grid-template-columns: 1fr;
  }

  .form-actions {
    justify-content: flex-start;
  }
}
</style>
