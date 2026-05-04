import type { UserRole } from '@/constants/user'

export interface User {
  id: number
  username: string
  createdAt?: string
  role: UserRole | string
  rating?: number
  maxRating?: number
  email?: string
  bio?: string
  solvedCount?: number
}

export interface LoginRequest {
  account: string
  password: string
}

export interface LoginResponse {
  tokenName: string
  tokenValue: string
  userInfo: User
}

export interface RegisterForm {
  username: string
  email: string
  password: string
}

export interface RegisterRequest extends RegisterForm {
  role: UserRole
}

export interface RegisterResponse {
  id: number
}

export type PublicUserQuery =
  | { userId: number; username?: never }
  | { username: string; userId?: never }

export interface UserRoleUpdateRequest {
  userId: number
  role: UserRole
}

export interface AuthSession {
  tokenName: string
  tokenValue: string
  userInfo: User
}
