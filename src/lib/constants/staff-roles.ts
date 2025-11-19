export const STAFF_ROLES = [
  'admin',
  'manager',
  'chef',
  'cleaning',
  'security',
  'maintenance',
] as const

export type StaffRole = (typeof STAFF_ROLES)[number]

export const STAFF_ROLE_LABELS: Record<StaffRole, string> = {
  admin: 'Admin',
  manager: 'Manager',
  chef: 'Chef',
  cleaning: 'Cleaning',
  security: 'Security',
  maintenance: 'Maintenance',
}
