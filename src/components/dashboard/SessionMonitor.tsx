'use client'

import { useEffect } from 'react'
import { useUser } from '@/lib/state/user'

interface SessionMonitorProps {
  redirectTo?: string
}

export function SessionMonitor({ redirectTo = '/auth/sign-in' }: SessionMonitorProps) {
  const { status, user, logout } = useUser()

  useEffect(() => {
    // Monitor for session expiration
    const handleSessionExpiration = () => {
      if (status === 'unauthenticated' && user) {
        // User was authenticated but now is not - session expired
        logout()
        window.location.href = redirectTo
      }
    }

    // Check session status periodically
    const interval = setInterval(
      () => {
        if (status === 'authenticated') {
          // Trigger a session check
          fetch('/api/customers/me', {
            method: 'GET',
            credentials: 'include',
          })
            .then(async (res) => {
              if (res.ok) {
                const data = await res.json()
                if (!data?.user) {
                  // Session expired - user is null
                  logout()
                  window.location.href = redirectTo
                }
              } else if (res.status === 401) {
                // Unauthorized - session expired
                logout()
                window.location.href = redirectTo
              }
            })
            .catch(() => {
              // Network error - don't logout, just ignore
            })
        }
      },
      5 * 60 * 1000,
    ) // Check every 5 minutes

    return () => clearInterval(interval)
  }, [status, user, logout, redirectTo])

  // Also monitor for visibility changes to check session when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && status === 'authenticated') {
        // User returned to tab - check session
        fetch('/api/customers/me', {
          method: 'GET',
          credentials: 'include',
        })
          .then(async (res) => {
            if (res.ok) {
              const data = await res.json()
              if (!data?.user) {
                // Session expired while user was away
                logout()
                window.location.href = redirectTo
              }
            } else if (res.status === 401) {
              // Unauthorized - session expired
              logout()
              window.location.href = redirectTo
            }
          })
          .catch(() => {
            // Network error - don't logout, just ignore
          })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [status, logout, redirectTo])

  return null // This component doesn't render anything
}
