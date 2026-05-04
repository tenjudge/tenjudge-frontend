import { API_ENDPOINTS } from '@/api/endpoints'
import { http } from '@/api/client'
import { DEFAULT_REGISTER_ROLE } from '@/constants/user'
import type {
  LoginRequest,
  LoginResponse,
  PublicUserQuery,
  RegisterForm,
  RegisterRequest,
  RegisterResponse,
  User,
  UserRoleUpdateRequest,
} from '@/types/auth'

export function login(payload: LoginRequest): Promise<LoginResponse> {
  return http.post(API_ENDPOINTS.auth.login, payload)
}

export function register(payload: RegisterForm): Promise<RegisterResponse> {
  return http.post(API_ENDPOINTS.auth.register, {
    ...payload,
    role: DEFAULT_REGISTER_ROLE,
  })
}

export function adminRegister(payload: RegisterRequest): Promise<RegisterResponse> {
  return http.post(API_ENDPOINTS.auth.register, payload)
}

export function getPublicUser(query: PublicUserQuery): Promise<User> {
  return http.get(API_ENDPOINTS.auth.user, { params: query })
}

export function updateUserRole(payload: UserRoleUpdateRequest): Promise<void> {
  return http.put(API_ENDPOINTS.auth.adminUserRole, payload)
}

export function logout(): Promise<void> {
  return http.delete(API_ENDPOINTS.auth.logout)
}
