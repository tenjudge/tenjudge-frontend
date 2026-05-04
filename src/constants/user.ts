export const USER_ROLES = {
  user: 'user',
  admin: 'admin',
  superAdmin: 'super_admin',
} as const

export const DEFAULT_REGISTER_ROLE = USER_ROLES.user

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export function isAdminRole(role?: string | null): boolean {
  return role === USER_ROLES.admin || role === USER_ROLES.superAdmin
}

export function isSuperAdminRole(role?: string | null): boolean {
  return role === USER_ROLES.superAdmin
}
