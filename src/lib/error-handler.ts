import { toast } from 'sonner'

export interface ErrorInfo {
  message: string
  code?: string
  details?: any
  timestamp: Date
}

export class DashboardError extends Error {
  public code?: string
  public details?: any
  public timestamp: Date

  constructor(message: string, code?: string, details?: any) {
    super(message)
    this.name = 'DashboardError'
    this.code = code
    this.details = details
    this.timestamp = new Date()
  }
}

export class NetworkError extends DashboardError {
  constructor(message: string = 'Network connection failed', details?: any) {
    super(message, 'NETWORK_ERROR', details)
    this.name = 'NetworkError'
  }
}

export class ValidationError extends DashboardError {
  constructor(message: string, details?: any) {
    super(message, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends DashboardError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 'AUTH_ERROR', details)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends DashboardError {
  constructor(message: string = 'Access denied', details?: any) {
    super(message, 'FORBIDDEN', details)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends DashboardError {
  constructor(message: string = 'Resource not found', details?: any) {
    super(message, 'NOT_FOUND', details)
    this.name = 'NotFoundError'
  }
}

export class ServerError extends DashboardError {
  constructor(message: string = 'Server error occurred', details?: any) {
    super(message, 'SERVER_ERROR', details)
    this.name = 'ServerError'
  }
}

export function handleError(error: unknown, context?: string): ErrorInfo {
  let errorInfo: ErrorInfo

  if (error instanceof DashboardError) {
    errorInfo = {
      message: error.message,
      code: error.code,
      details: error.details,
      timestamp: error.timestamp,
    }
  } else if (error instanceof Error) {
    errorInfo = {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      details: { stack: error.stack },
      timestamp: new Date(),
    }
  } else {
    errorInfo = {
      message: String(error),
      code: 'UNKNOWN_ERROR',
      details: error,
      timestamp: new Date(),
    }
  }

  // Log error for debugging
  console.error(`[${context || 'Dashboard'}] Error:`, errorInfo)

  // Show user-friendly toast notification
  showErrorToast(errorInfo)

  return errorInfo
}

export function showErrorToast(errorInfo: ErrorInfo) {
  const getErrorMessage = (error: ErrorInfo) => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Connection failed. Please check your internet connection and try again.'
      case 'VALIDATION_ERROR':
        return error.message || 'Please check your input and try again.'
      case 'AUTH_ERROR':
        return 'Your session has expired. Please log in again.'
      case 'FORBIDDEN':
        return "You don't have permission to perform this action."
      case 'NOT_FOUND':
        return 'The requested resource was not found.'
      case 'SERVER_ERROR':
        return 'A server error occurred. Please try again later.'
      default:
        return error.message || 'An unexpected error occurred. Please try again.'
    }
  }

  toast.error(getErrorMessage(errorInfo), {
    duration: 5000,
    action: {
      label: 'Dismiss',
      onClick: () => toast.dismiss(),
    },
  })
}

export function handleAsyncError<T>(promise: Promise<T>, context?: string): Promise<T> {
  return promise.catch((error) => {
    handleError(error, context)
    throw error
  })
}

export function createErrorHandler(context?: string) {
  return (error: unknown) => handleError(error, context)
}

// Error boundary error handler
export function handleErrorBoundaryError(error: Error, errorInfo: any) {
  const errorInfoObj: ErrorInfo = {
    message: error.message,
    code: 'REACT_ERROR',
    details: {
      componentStack: errorInfo.componentStack,
      stack: error.stack,
    },
    timestamp: new Date(),
  }

  console.error('Error Boundary caught error:', errorInfoObj)

  // Don't show toast for React errors in development
  if (process.env.NODE_ENV === 'production') {
    showErrorToast(errorInfoObj)
  }
}

// API error handler
export function handleApiError(response: Response, context?: string): never {
  let error: DashboardError

  switch (response.status) {
    case 400:
      error = new ValidationError('Invalid request data')
      break
    case 401:
      error = new AuthenticationError('Authentication required')
      break
    case 403:
      error = new AuthorizationError('Access denied')
      break
    case 404:
      error = new NotFoundError('Resource not found')
      break
    case 500:
      error = new ServerError('Internal server error')
      break
    default:
      error = new DashboardError(`HTTP ${response.status}: ${response.statusText}`)
  }

  throw error
}

// Form validation error handler
export function handleValidationError(errors: Record<string, string[]>): never {
  const errorMessages = Object.values(errors).flat()
  const message = errorMessages.length > 0 ? errorMessages[0] : 'Validation failed'

  throw new ValidationError(message, { fieldErrors: errors })
}

// Network error handler
export function handleNetworkError(error: unknown): never {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new NetworkError()
  }

  throw new DashboardError('Network error occurred')
}
