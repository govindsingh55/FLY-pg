import { JobResult, PaymentConfig, CustomerPaymentSettings } from './types'

/**
 * Utility functions for payment jobs
 */

/**
 * Check if the payment system is enabled
 */
export async function isPaymentSystemEnabled(payload: any): Promise<boolean> {
  try {
    const config = await payload.find({
      collection: 'payment-configs',
      limit: 1,
      sort: '-createdAt',
    })

    if (!config.docs || config.docs.length === 0) {
      return false
    }

    return config.docs[0].isEnabled === true
  } catch (error) {
    console.error('Error checking payment system status:', error)
    return false
  }
}

/**
 * Check if the current date is after the configured start date
 */
export async function isAfterStartDate(payload: any): Promise<boolean> {
  try {
    const config = await payload.find({
      collection: 'payment-configs',
      limit: 1,
      sort: '-createdAt',
    })

    if (!config.docs || config.docs.length === 0) {
      return false
    }

    const startDate = new Date(config.docs[0].startDate)
    const currentDate = new Date()

    return currentDate >= startDate
  } catch (error) {
    console.error('Error checking start date:', error)
    return false
  }
}

/**
 * Get list of excluded customers
 */
export async function getExcludedCustomers(payload: any): Promise<string[]> {
  try {
    const config = await payload.find({
      collection: 'payment-configs',
      limit: 1,
      sort: '-createdAt',
    })

    if (!config.docs || config.docs.length === 0) {
      return []
    }

    return config.docs[0].excludedCustomers || []
  } catch (error) {
    console.error('Error getting excluded customers:', error)
    return []
  }
}

/**
 * Check if a customer is excluded from payment processing
 */
export async function isCustomerExcluded(payload: any, customerId: string): Promise<boolean> {
  try {
    // Check global exclusions
    const globalExclusions = await getExcludedCustomers(payload)
    if (globalExclusions.includes(customerId)) {
      return true
    }

    // Check customer-specific settings
    const customerSettings = await payload.find({
      collection: 'customer-payment-settings',
      where: {
        customer: { equals: customerId },
      },
      limit: 1,
    })

    if (customerSettings.docs && customerSettings.docs.length > 0) {
      return customerSettings.docs[0].excludedFromSystem === true
    }

    return false
  } catch (error) {
    console.error('Error checking customer exclusion:', error)
    return false
  }
}

/**
 * Check if customer notifications are enabled
 */
export async function areCustomerNotificationsEnabled(
  payload: any,
  customerId: string,
): Promise<boolean> {
  try {
    const customerSettings = await payload.find({
      collection: 'customer-payment-settings',
      where: {
        customer: { equals: customerId },
      },
      limit: 1,
    })

    if (customerSettings.docs && customerSettings.docs.length > 0) {
      return customerSettings.docs[0].notificationsEnabled !== false
    }

    // Default to enabled if no specific settings
    return true
  } catch (error) {
    console.error('Error checking customer notification settings:', error)
    return true
  }
}

/**
 * Get customer-specific reminder days or use defaults
 */
export async function getCustomerReminderDays(payload: any, customerId: string): Promise<number[]> {
  try {
    const customerSettings = await payload.find({
      collection: 'customer-payment-settings',
      where: {
        customer: { equals: customerId },
      },
      limit: 1,
    })

    if (customerSettings.docs && customerSettings.docs.length > 0) {
      const customDays = customerSettings.docs[0].customReminderDays
      if (customDays && customDays.length > 0) {
        return customDays
      }
    }

    // Get default reminder days from global config
    const config = await payload.find({
      collection: 'payment-configs',
      limit: 1,
      sort: '-createdAt',
    })

    if (config.docs && config.docs.length > 0) {
      return config.docs[0].reminderDays || [7, 3, 1] // Default: 7, 3, 1 days before
    }

    return [7, 3, 1] // Fallback default
  } catch (error) {
    console.error('Error getting reminder days:', error)
    return [7, 3, 1] // Fallback default
  }
}

/**
 * Create a successful job result
 */
export function createSuccessResult(
  message: string,
  data?: any,
  recordsProcessed: number = 0,
): JobResult {
  return {
    success: true,
    message,
    data,
    executionTime: 0, // Will be set by the job
    recordsProcessed,
    recordsFailed: 0,
  }
}

/**
 * Create a failed job result
 */
export function createFailureResult(
  message: string,
  error?: Error,
  recordsProcessed: number = 0,
  recordsFailed: number = 0,
): JobResult {
  return {
    success: false,
    message,
    error,
    executionTime: 0, // Will be set by the job
    recordsProcessed,
    recordsFailed,
  }
}

/**
 * Validate payment configuration
 */
export function validatePaymentConfig(config: Partial<PaymentConfig>): string[] {
  const errors: string[] = []

  if (config.monthlyPaymentDay && (config.monthlyPaymentDay < 1 || config.monthlyPaymentDay > 31)) {
    errors.push('Monthly payment day must be between 1 and 31')
  }

  if (config.reminderDays) {
    for (const day of config.reminderDays) {
      if (day < 0 || day > 30) {
        errors.push('Reminder days must be between 0 and 30')
      }
    }
  }

  if (config.overdueCheckDays) {
    for (const day of config.overdueCheckDays) {
      if (day < 0 || day > 90) {
        errors.push('Overdue check days must be between 0 and 90')
      }
    }
  }

  if (config.startDate && new Date(config.startDate) < new Date()) {
    errors.push('Start date cannot be in the past')
  }

  return errors
}

/**
 * Log job execution
 */
export function logJobExecution(
  jobName: string,
  status: 'started' | 'completed' | 'failed',
  details?: any,
): void {
  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    jobName,
    status,
    details,
  }

  console.log(`[${timestamp}] Job ${jobName}: ${status}`, details || '')
}

/**
 * Calculate next payment due date
 */
export function calculateNextPaymentDueDate(
  monthlyPaymentDay: number,
  baseDate: Date = new Date(),
): Date {
  const currentDate = new Date(baseDate)
  const currentDay = currentDate.getDate()

  if (currentDay >= monthlyPaymentDay) {
    // Move to next month
    currentDate.setMonth(currentDate.getMonth() + 1)
  }

  // Set to the specified day of the month
  currentDate.setDate(monthlyPaymentDay)

  // Reset time to start of day
  currentDate.setHours(0, 0, 0, 0)

  return currentDate
}

/**
 * Check if a date is a reminder day for a payment
 */
export function isReminderDay(
  dueDate: Date,
  reminderDays: number[],
  currentDate: Date = new Date(),
): boolean {
  const daysUntilDue = Math.ceil(
    (dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
  )
  return reminderDays.includes(daysUntilDue)
}

/**
 * Check if a payment is overdue
 */
export function isPaymentOverdue(
  dueDate: Date,
  overdueCheckDays: number[],
  currentDate: Date = new Date(),
): boolean {
  const daysOverdue = Math.ceil((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24))
  return overdueCheckDays.includes(daysOverdue)
}
