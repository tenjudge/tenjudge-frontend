import { defineStore } from 'pinia'

import * as authApi from '@/api/auth'
import { STORAGE_KEYS } from '@/config/storage'
import { isAdminRole, isSuperAdminRole } from '@/constants/user'
import type { AuthSession, LoginRequest, RegisterForm, User } from '@/types/auth'
import { readJsonStorage, removeStorage, writeJsonStorage } from '@/utils/storage'

interface AuthState {
  tokenName: string
  tokenValue: string
  userInfo: User | null
  initialized: boolean
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    tokenName: '',
    tokenValue: '',
    userInfo: null,
    initialized: false,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.tokenName && state.tokenValue),
    username: (state) => state.userInfo?.username ?? '',
    isAdmin: (state) => isAdminRole(state.userInfo?.role),
    isSuperAdmin: (state) => isSuperAdminRole(state.userInfo?.role),
  },

  actions: {
    restoreSession() {
      const session = readJsonStorage<AuthSession>(STORAGE_KEYS.auth)

      if (session?.tokenName && session.tokenValue && session.userInfo) {
        this.tokenName = session.tokenName
        this.tokenValue = session.tokenValue
        this.userInfo = session.userInfo
      }

      this.initialized = true
    },

    async login(payload: LoginRequest) {
      const session = await authApi.login(payload)
      this.setSession(session)
      return session
    },

    async register(payload: RegisterForm) {
      return authApi.register(payload)
    },

    async logout() {
      try {
        if (this.isAuthenticated) {
          await authApi.logout()
        }
      } finally {
        this.clearSession()
      }
    },

    setSession(session: AuthSession) {
      this.tokenName = session.tokenName
      this.tokenValue = session.tokenValue
      this.userInfo = session.userInfo
      writeJsonStorage(STORAGE_KEYS.auth, session)
    },

    clearSession() {
      this.tokenName = ''
      this.tokenValue = ''
      this.userInfo = null
      removeStorage(STORAGE_KEYS.auth)
    },
  },
})
