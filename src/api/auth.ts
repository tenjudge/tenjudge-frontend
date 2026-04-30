import { API_ENDPOINTS } from '@/api/endpoints'
import { http } from '@/api/client'
import { DEFAULT_REGISTER_ROLE } from '@/constants/user'
import type { LoginRequest, LoginResponse, RegisterForm, RegisterResponse } from '@/types/auth'

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return http.post(API_ENDPOINTS.auth.login, payload)
}

export function register(payload: RegisterForm): Promise<RegisterResponse> {
  return http.post(API_ENDPOINTS.auth.register, {
    ...payload,
    role: DEFAULT_REGISTER_ROLE,
  })
}

export function logout(): Promise<void> {
  return http.delete(API_ENDPOINTS.auth.logout)
}

