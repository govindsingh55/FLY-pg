import type { AccessArgs } from 'payload'

// Extend the user type to include custom fields
type UserWithRole = {
  id: string | number
  role?: string
  [key: string]: any
}

type AccessFn = (args: AccessArgs<UserWithRole>) => boolean | object

export const usersAccess = ({ req }: AccessArgs) => {
  const user = req.user as { role?: string } | undefined
  if (!user) return false
  return user.role === 'admin' || user.role === 'manager'
}

export const customersAccess: AccessFn = ({ req }) => {
  const user = req.user as unknown as UserWithRole | undefined
  if (!user) return false
  if (user.role === 'customer') {
    return {
      id: { equals: user.id },
    }
  }
  // Admins and managers can access all
  return user.role === 'admin' || user.role === 'manager'
}

type isAuthenticated = (args: AccessArgs<UserWithRole>) => boolean

export const authenticated: isAuthenticated = ({ req }) => {
  return Boolean(req.user)
}
