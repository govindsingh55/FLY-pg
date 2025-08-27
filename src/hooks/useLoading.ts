import { useState, useCallback, useRef } from 'react'

interface LoadingState {
  isLoading: boolean
  error: Error | null
  startTime: number | null
  duration: number | null
}

interface UseLoadingOptions {
  minDuration?: number
  onError?: (error: Error) => void
  onSuccess?: () => void
}

export function useLoading(options: UseLoadingOptions = {}) {
  const { minDuration = 0, onError, onSuccess } = options
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    startTime: null,
    duration: null,
  })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const startLoading = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
      startTime: Date.now(),
      duration: null,
    }))
  }, [])

  const stopLoading = useCallback(
    (error?: Error) => {
      const now = Date.now()
      const startTime = state.startTime || now
      const duration = now - startTime

      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error || null,
        duration,
      }))

      if (error && onError) {
        onError(error)
      } else if (!error && onSuccess) {
        onSuccess()
      }
    },
    [state.startTime, onError, onSuccess],
  )

  const withLoading = useCallback(
    async <T>(asyncFn: () => Promise<T>, minLoadingTime?: number): Promise<T> => {
      const effectiveMinDuration = minLoadingTime ?? minDuration

      startLoading()

      try {
        const result = await asyncFn()

        if (effectiveMinDuration > 0) {
          const elapsed = Date.now() - (state.startTime || Date.now())
          const remaining = Math.max(0, effectiveMinDuration - elapsed)

          if (remaining > 0) {
            await new Promise((resolve) => {
              timeoutRef.current = setTimeout(resolve, remaining)
            })
          }
        }

        stopLoading()
        return result
      } catch (error) {
        stopLoading(error instanceof Error ? error : new Error(String(error)))
        throw error
      }
    },
    [startLoading, stopLoading, minDuration, state.startTime],
  )

  const reset = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    setState({
      isLoading: false,
      error: null,
      startTime: null,
      duration: null,
    })
  }, [])

  return {
    isLoading: state.isLoading,
    error: state.error,
    duration: state.duration,
    startLoading,
    stopLoading,
    withLoading,
    reset,
  }
}

// Hook for managing multiple loading states
export function useLoadingStates() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates((prev) => ({
      ...prev,
      [key]: isLoading,
    }))
  }, [])

  const startLoading = useCallback(
    (key: string) => {
      setLoading(key, true)
    },
    [setLoading],
  )

  const stopLoading = useCallback(
    (key: string) => {
      setLoading(key, false)
    },
    [setLoading],
  )

  const withLoading = useCallback(
    async <T>(key: string, asyncFn: () => Promise<T>): Promise<T> => {
      startLoading(key)
      try {
        const result = await asyncFn()
        stopLoading(key)
        return result
      } catch (error) {
        stopLoading(key)
        throw error
      }
    },
    [startLoading, stopLoading],
  )

  const isAnyLoading = Object.values(loadingStates).some(Boolean)
  const isLoading = (key: string) => loadingStates[key] || false

  return {
    loadingStates,
    isAnyLoading,
    isLoading,
    setLoading,
    startLoading,
    stopLoading,
    withLoading,
  }
}

// Hook for managing loading states with retry functionality
export function useLoadingWithRetry(options: UseLoadingOptions & { maxRetries?: number } = {}) {
  const { maxRetries = 3, ...loadingOptions } = options
  const [retryCount, setRetryCount] = useState(0)
  const loading = useLoading(loadingOptions)

  const withRetry = useCallback(
    async <T>(asyncFn: () => Promise<T>, retries = maxRetries): Promise<T> => {
      try {
        return await loading.withLoading(asyncFn)
      } catch (error) {
        if (retries > 0) {
          setRetryCount((prev) => prev + 1)
          return withRetry(asyncFn, retries - 1)
        }
        throw error
      }
    },
    [loading, maxRetries],
  )

  const resetRetry = useCallback(() => {
    setRetryCount(0)
    loading.reset()
  }, [loading])

  return {
    ...loading,
    retryCount,
    withRetry,
    resetRetry,
  }
}

// Hook for managing loading states with progress
export function useLoadingWithProgress() {
  const [progress, setProgress] = useState(0)
  const loading = useLoading()

  const withProgress = useCallback(
    async <T>(asyncFn: (onProgress: (progress: number) => void) => Promise<T>): Promise<T> => {
      return loading.withLoading(async () => {
        setProgress(0)
        const result = await asyncFn(setProgress)
        setProgress(100)
        return result
      })
    },
    [loading],
  )

  const resetProgress = useCallback(() => {
    setProgress(0)
    loading.reset()
  }, [loading])

  return {
    ...loading,
    progress,
    withProgress,
    resetProgress,
  }
}
