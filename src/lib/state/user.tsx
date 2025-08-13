'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useReducer,
} from 'react'

type AuthCollection = 'users' | 'customers'

export interface AuthUserBase {
  id: string
  email?: string | null
  name?: string | null
  role?: string | null
  collection: AuthCollection
  [key: string]: any
}

export const AUTH_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  AUTHENTICATED: 'authenticated',
  UNAUTHENTICATED: 'unauthenticated',
} as const

type AuthStatus = (typeof AUTH_STATUS)[keyof typeof AUTH_STATUS]

interface UserState {
  user: AuthUserBase | null
  status: AuthStatus
  error: string | null
}

type UserAction =
  | { type: 'SET_LOADING' }
  | { type: 'SET_AUTHENTICATED'; user: AuthUserBase }
  | { type: 'SET_UNAUTHENTICATED' }
  | { type: 'SET_ERROR'; error: string }
  | { type: 'RESET_ERROR' }

interface UserContextValue {
  user: AuthUserBase | null
  status: AuthStatus
  error: string | null
  isAuthenticated: boolean
  // ...existing code...
  logout: () => Promise<void>
  refresh: () => Promise<boolean>
  refetchUser: () => Promise<void>
  // New fine-grained action setters for server-action based flows
  setAuthLoading: () => void
  setAuthenticated: (user: AuthUserBase) => void
  setUnauthenticated: () => void
  setAuthError: (error: string) => void
}

const UserCtx = createContext<UserContextValue | null>(null)

const DEFAULT_REFRESH_INTERVAL_MS = 12 * 60 * 1000
function getApiBase() {
  return process.env.NEXT_PUBLIC_API_BASE || ''
}
let globalRefreshPromise: Promise<boolean> | null = null

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, status: 'loading', error: null }
    case 'SET_AUTHENTICATED':
      return { user: action.user, status: 'authenticated', error: null }
    case 'SET_UNAUTHENTICATED':
      return { user: null, status: 'unauthenticated', error: null }
    case 'SET_ERROR':
      return { ...state, error: action.error, status: 'unauthenticated', user: null }
    case 'RESET_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

export function UserProvider({
  children,
  refreshIntervalMs,
}: {
  children: React.ReactNode
  refreshIntervalMs?: number
}) {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    status: 'idle',
    error: null,
  })
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const mountedRef = useRef(false)
  const apiBase = getApiBase()

  const setUnauthenticated = useCallback(() => {
    dispatch({ type: 'SET_UNAUTHENTICATED' })
  }, [])

  const fetchMe = useCallback(
    async (signal?: AbortSignal) => {
      dispatch({ type: 'SET_LOADING' })
      try {
        const res = await fetch(`${apiBase}/api/customers/me`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          signal,
        })
        if (res.ok) {
          const data = await res.json()
          if (data?.user) {
            dispatch({ type: 'SET_AUTHENTICATED', user: { ...data.user, collection: 'customers' } })
            return
          } else {
            // If ok but user is null, treat as unauthenticated and set error for debugging
            dispatch({ type: 'SET_ERROR', error: `No user found: ${data?.message || 'Unknown'}` })
            setUnauthenticated()
            return
          }
        }
        if (res.status === 401) {
          setUnauthenticated()
          return
        }
        // Other error statuses
        let txt = ''
        try {
          txt = await res.text()
        } catch {}
        dispatch({ type: 'SET_ERROR', error: `Error fetching customers/me: ${res.status} ${txt}` })
        setUnauthenticated()
      } catch (err: any) {
        if (err?.name === 'AbortError') return
        dispatch({ type: 'SET_ERROR', error: err.message || 'Failed to load user' })
        setUnauthenticated()
      }
    },
    [apiBase, setUnauthenticated],
  )

  const refresh = useCallback(async () => {
    if (globalRefreshPromise) return globalRefreshPromise
    globalRefreshPromise = (async () => {
      try {
        const res = await fetch(`${apiBase}/api/customers/refresh-token`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        })
        if (res.ok) {
          await fetchMe()
          return true
        }
        setUnauthenticated()
        return false
      } catch {
        setUnauthenticated()
        return false
      } finally {
        globalRefreshPromise = null
      }
    })()
    return globalRefreshPromise
  }, [apiBase, fetchMe, setUnauthenticated])

  const logout = useCallback(async () => {
    try {
      if (state.user) {
        await fetch(`${apiBase}/api/${state.user.collection}/logout`, {
          method: 'POST',
          credentials: 'include',
        })
      }
    } catch {}
    setUnauthenticated()
  }, [apiBase, state.user, setUnauthenticated])

  const refetchUser = useCallback(async () => {
    dispatch({ type: 'SET_LOADING' })
    await fetchMe()
  }, [fetchMe])

  useEffect(() => {
    if (mountedRef.current) return
    mountedRef.current = true
    dispatch({ type: 'SET_LOADING' })
    const abort = new AbortController()
    fetchMe(abort.signal)
    return () => abort.abort()
  }, [fetchMe])

  useEffect(() => {
    const interval = refreshIntervalMs ?? DEFAULT_REFRESH_INTERVAL_MS
    if (!interval) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (state.status === 'authenticated') {
        refresh()
      }
    }, interval)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [refresh, state.status, refreshIntervalMs])

  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible' && state.status === 'authenticated') {
        refresh()
      }
    }
    document.addEventListener('visibilitychange', handler)
    return () => document.removeEventListener('visibilitychange', handler)
  }, [refresh, state.status])

  const value: UserContextValue = useMemo(
    () => ({
      user: state.user,
      status: state.status,
      error: state.error,
      isAuthenticated: state.status === 'authenticated' && !!state.user,
      logout,
      refresh,
      refetchUser,
      setAuthLoading: () => dispatch({ type: 'SET_LOADING' }),
      setAuthenticated: (user: AuthUserBase) => dispatch({ type: 'SET_AUTHENTICATED', user }),
      setUnauthenticated: () => dispatch({ type: 'SET_UNAUTHENTICATED' }),
      setAuthError: (error: string) => dispatch({ type: 'SET_ERROR', error }),
    }),
    [state, logout, refresh, refetchUser],
  )

  return <UserCtx.Provider value={value}>{children}</UserCtx.Provider>
}

export function useUser() {
  const ctx = useContext(UserCtx)
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>')
  return ctx
}

export function useLogout() {
  const { logout } = useUser()
  return logout
}

// Hook to access fine-grained auth state setters (for server-action flows)
export function useAuthActions() {
  const ctx = useUser()
  return {
    setAuthLoading: ctx.setAuthLoading,
    setAuthenticated: ctx.setAuthenticated,
    setUnauthenticated: ctx.setUnauthenticated,
    setAuthError: ctx.setAuthError,
    refetchUser: ctx.refetchUser,
  }
}

export function useRequireAuth({ redirectTo }: { redirectTo?: string } = {}) {
  const { isAuthenticated, status } = useUser()
  useEffect(() => {
    if (redirectTo && status === 'unauthenticated') {
      import('next/navigation').then(({ useRouter }) => {
        const r = (useRouter as any)()
        r.push(redirectTo)
      })
    }
  }, [status, redirectTo, isAuthenticated])
  return { isAuthenticated, loading: status === 'loading', status }
}

export const RequireAuth: React.FC<{ children: React.ReactNode; redirectTo?: string }> = ({
  children,
}) => {
  const { status } = useUser()
  if (status === 'loading' || status === 'idle') return null
  if (status !== 'authenticated') return null
  return <>{children}</>
}
