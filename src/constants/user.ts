export const USER_ROLES = {
  user: 'user',
  admin: 'admin',
  superAdmin: 'super_admin',
} as const

export const DEFAULT_REGISTER_ROLE = USER_ROLES.user

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [USER_ROLES.user]: 'User',
  [USER_ROLES.admin]: 'Admin',
  [USER_ROLES.superAdmin]: 'Super Admin',
}

export const USER_ROLE_OPTIONS = [
  { value: USER_ROLES.user, label: USER_ROLE_LABELS[USER_ROLES.user] },
  { value: USER_ROLES.admin, label: USER_ROLE_LABELS[USER_ROLES.admin] },
  { value: USER_ROLES.superAdmin, label: USER_ROLE_LABELS[USER_ROLES.superAdmin] },
] as const

export function isAdminRole(role?: string | null): boolean {
  return role === USER_ROLES.admin || role === USER_ROLES.superAdmin
}

export function isSuperAdminRole(role?: string | null): boolean {
  return role === USER_ROLES.superAdmin
}
