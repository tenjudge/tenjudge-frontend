export const USER_ROLES = {
  user: 'user',
  admin: 'admin',
  superAdmin: 'super_admin',
} as const

export const DEFAULT_REGISTER_ROLE = USER_ROLES.user

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES]

