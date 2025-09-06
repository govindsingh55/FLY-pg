/**
 * Protected routes configuration
 * These routes cannot be created as dynamic pages from PayloadCMS
 * to prevent conflicts with existing manually created pages
 */

export const PROTECTED_ROUTES = [
  // Dashboard routes
  '/dashboard',
  '/dashboard/bookings',
  '/dashboard/profile',
  '/dashboard/rent',
  '/dashboard/settings',
  '/dashboard/support',
  '/dashboard/notifications',

  // Authentication routes
  '/auth',
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-email',

  // Admin routes
  '/admin',

  // Property routes
  '/properties',

  // Payment routes
  '/payments',

  // API routes
  '/api',

  // Test routes
  '/test-single-property',
] as const

export const PROTECTED_ROUTE_PATTERNS = [
  // Dynamic routes that should be protected
  /^\/dashboard\/.*$/,
  /^\/auth\/.*$/,
  /^\/admin\/.*$/,
  /^\/properties\/.*$/,
  /^\/payments\/.*$/,
  /^\/api\/.*$/,
] as const

/**
 * Check if a route is protected and cannot be created as a dynamic page
 */
export function isRouteProtected(slug: string): boolean {
  // Check exact matches
  if (PROTECTED_ROUTES.includes(slug as any)) {
    return true
  }

  // Check pattern matches
  return PROTECTED_ROUTE_PATTERNS.some((pattern) => pattern.test(slug))
}

/**
 * Check if a route conflicts with existing manual pages
 */
export function hasRouteConflict(slug: string): boolean {
  return isRouteProtected(slug)
}
