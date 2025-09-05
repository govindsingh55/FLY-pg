// Job Scheduling Configuration System
// Following PayloadCMS v3 jobs scheduling documentation

import type { Payload } from 'payload'

export interface JobScheduleConfig {
  slug: string
  cron: string
  queue: string
  enabled: boolean
  timezone?: string
  description: string
  input?: Record<string, unknown>
  retryConfig?: {
    maxRetries: number
    retryDelay: number
  }
}

export interface SchedulingConfig {
  timezone: string
  defaultQueue: string
  maxConcurrentJobs: number
  jobTimeout: number
  healthCheckInterval: number
}

/**
 * Payment Job Scheduling Configuration
 * Centralized configuration for all payment-related job schedules
 */
export class PaymentJobScheduler {
  private static readonly DEFAULT_TIMEZONE = 'Asia/Kolkata'
  private static readonly DEFAULT_QUEUE = 'payment-jobs'
  private static readonly MAX_CONCURRENT_JOBS = 5
  private static readonly JOB_TIMEOUT = 30 * 60 * 1000 // 30 minutes
  private static readonly HEALTH_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

  /**
   * Get scheduling configuration
   */
  static getSchedulingConfig(): SchedulingConfig {
    return {
      timezone: this.DEFAULT_TIMEZONE,
      defaultQueue: this.DEFAULT_QUEUE,
      maxConcurrentJobs: this.MAX_CONCURRENT_JOBS,
      jobTimeout: this.JOB_TIMEOUT,
      healthCheckInterval: this.HEALTH_CHECK_INTERVAL,
    }
  }

  /**
   * Get all payment job schedules
   */
  static getJobSchedules(): JobScheduleConfig[] {
    return [
      // Monthly Rent Payment - 1st of every month at 6 AM
      {
        slug: 'monthly-rent-payment',
        cron: '0 6 1 * *', // 1st of every month at 6 AM
        queue: this.DEFAULT_QUEUE,
        enabled: true,
        timezone: this.DEFAULT_TIMEZONE,
        description: 'Generate monthly rent payments for all active bookings',
        input: {
          autoCreate: true,
          includeFoodCharges: true,
        },
        retryConfig: {
          maxRetries: 3,
          retryDelay: 5 * 60 * 1000, // 5 minutes
        },
      },

      // Payment Reminder Emails - Daily at 9 AM
      {
        slug: 'payment-reminder-email',
        cron: '0 9 * * *', // Daily at 9 AM
        queue: this.DEFAULT_QUEUE,
        enabled: true,
        timezone: this.DEFAULT_TIMEZONE,
        description: 'Send payment reminder emails to customers',
        input: {
          reminderDay: 0, // Will be calculated dynamically
          dueDate: new Date().toISOString(),
        },
        retryConfig: {
          maxRetries: 2,
          retryDelay: 2 * 60 * 1000, // 2 minutes
        },
      },

      // Overdue Payment Notifications - Daily at 10 AM
      {
        slug: 'overdue-payment-notification',
        cron: '0 10 * * *', // Daily at 10 AM
        queue: this.DEFAULT_QUEUE,
        enabled: true,
        timezone: this.DEFAULT_TIMEZONE,
        description: 'Send overdue payment notifications to customers',
        input: {
          overdueDay: 0, // Will be calculated dynamically
          dueDate: new Date().toISOString(),
        },
        retryConfig: {
          maxRetries: 2,
          retryDelay: 2 * 60 * 1000, // 2 minutes
        },
      },

      // Auto-Pay Processing - Daily at 8 AM
      {
        slug: 'auto-pay-processing',
        cron: '0 8 * * *', // Daily at 8 AM
        queue: this.DEFAULT_QUEUE,
        enabled: true,
        timezone: this.DEFAULT_TIMEZONE,
        description: 'Process automatic payments for customers with auto-pay enabled',
        input: {
          processDate: new Date().toISOString(),
          maxRetries: 3,
        },
        retryConfig: {
          maxRetries: 3,
          retryDelay: 10 * 60 * 1000, // 10 minutes
        },
      },

      // Job Health Check - Every 5 minutes
      {
        slug: 'job-health-check',
        cron: '*/5 * * * *', // Every 5 minutes
        queue: 'system-jobs',
        enabled: true,
        timezone: this.DEFAULT_TIMEZONE,
        description: 'Monitor job system health and performance',
        input: {
          checkInterval: 5 * 60 * 1000, // 5 minutes
        },
        retryConfig: {
          maxRetries: 1,
          retryDelay: 1 * 60 * 1000, // 1 minute
        },
      },

      // Payment Analytics - Daily at 11 PM
      {
        slug: 'payment-analytics',
        cron: '0 23 * * *', // Daily at 11 PM
        queue: 'analytics-jobs',
        enabled: true,
        timezone: this.DEFAULT_TIMEZONE,
        description: 'Generate daily payment analytics and reports',
        input: {
          reportDate: new Date().toISOString(),
          includeMetrics: true,
        },
        retryConfig: {
          maxRetries: 2,
          retryDelay: 5 * 60 * 1000, // 5 minutes
        },
      },
    ]
  }

  /**
   * Get schedule for a specific job
   */
  static getJobSchedule(slug: string): JobScheduleConfig | undefined {
    return this.getJobSchedules().find((schedule) => schedule.slug === slug)
  }

  /**
   * Check if a job schedule is enabled
   */
  static isJobEnabled(slug: string): boolean {
    const schedule = this.getJobSchedule(slug)
    return schedule ? schedule.enabled : false
  }

  /**
   * Enable/disable a job schedule
   */
  static toggleJobSchedule(slug: string, enabled: boolean): JobScheduleConfig | null {
    const schedules = this.getJobSchedules()
    const scheduleIndex = schedules.findIndex((s) => s.slug === slug)

    if (scheduleIndex !== -1) {
      schedules[scheduleIndex].enabled = enabled
      return schedules[scheduleIndex]
    }

    return null
  }

  /**
   * Get next execution time for a job
   */
  static getNextExecutionTime(cron: string, _timezone: string = this.DEFAULT_TIMEZONE): Date {
    // This is a simplified implementation
    // In production, you might want to use a library like 'node-cron' or 'cron-parser'
    const now = new Date()
    const nextRun = new Date(now)

    // Basic cron parsing for common patterns
    if (cron === '0 6 1 * *') {
      // 1st of every month at 6 AM
      nextRun.setMonth(now.getMonth() + 1)
      nextRun.setDate(1)
      nextRun.setHours(6, 0, 0, 0)
    } else if (cron === '0 9 * * *') {
      // Daily at 9 AM
      nextRun.setDate(now.getDate() + 1)
      nextRun.setHours(9, 0, 0, 0)
    } else if (cron === '0 10 * * *') {
      // Daily at 10 AM
      nextRun.setDate(now.getDate() + 1)
      nextRun.setHours(10, 0, 0, 0)
    } else if (cron === '0 8 * * *') {
      // Daily at 8 AM
      nextRun.setDate(now.getDate() + 1)
      nextRun.setHours(8, 0, 0, 0)
    } else if (cron === '*/5 * * * *') {
      // Every 5 minutes
      nextRun.setMinutes(now.getMinutes() + 5)
      nextRun.setSeconds(0, 0)
    } else if (cron === '0 23 * * *') {
      // Daily at 11 PM
      nextRun.setDate(now.getDate() + 1)
      nextRun.setHours(23, 0, 0, 0)
    }

    return nextRun
  }

  /**
   * Validate cron expression
   */
  static validateCronExpression(cron: string): { valid: boolean; error?: string } {
    const cronParts = cron.split(' ')

    if (cronParts.length !== 5) {
      return { valid: false, error: 'Cron expression must have exactly 5 parts' }
    }

    const [minute, hour, day, month, weekday] = cronParts

    // Basic validation for each part
    const validators = [
      { part: 'minute', value: minute, min: 0, max: 59 },
      { part: 'hour', value: hour, min: 0, max: 23 },
      { part: 'day', value: day, min: 1, max: 31 },
      { part: 'month', value: month, min: 1, max: 12 },
      { part: 'weekday', value: weekday, min: 0, max: 6 },
    ]

    for (const validator of validators) {
      if (validator.value !== '*') {
        const num = parseInt(validator.value)
        if (isNaN(num) || num < validator.min || num > validator.max) {
          return {
            valid: false,
            error: `Invalid ${validator.part} value: ${validator.value}`,
          }
        }
      }
    }

    return { valid: true }
  }

  /**
   * Get job execution statistics
   */
  static async getJobExecutionStats(_payload: Payload): Promise<{
    totalJobs: number
    successfulJobs: number
    failedJobs: number
    pendingJobs: number
    averageExecutionTime: number
  }> {
    try {
      // This would query the PayloadCMS jobs collection
      // For now, return mock data
      return {
        totalJobs: 0,
        successfulJobs: 0,
        failedJobs: 0,
        pendingJobs: 0,
        averageExecutionTime: 0,
      }
    } catch (error) {
      console.error('Error getting job execution stats:', error)
      return {
        totalJobs: 0,
        successfulJobs: 0,
        failedJobs: 0,
        pendingJobs: 0,
        averageExecutionTime: 0,
      }
    }
  }

  /**
   * Get job schedule status
   */
  static getJobScheduleStatus(): {
    enabled: number
    disabled: number
    total: number
    schedules: Array<{
      slug: string
      enabled: boolean
      nextRun: Date
      description: string
    }>
  } {
    const schedules = this.getJobSchedules()
    const enabled = schedules.filter((s) => s.enabled).length
    const disabled = schedules.filter((s) => !s.enabled).length

    return {
      enabled,
      disabled,
      total: schedules.length,
      schedules: schedules.map((schedule) => ({
        slug: schedule.slug,
        enabled: schedule.enabled,
        nextRun: this.getNextExecutionTime(schedule.cron, schedule.timezone),
        description: schedule.description,
      })),
    }
  }
}

/**
 * Job Schedule Constants
 */
export const JOB_SCHEDULES = {
  MONTHLY_RENT_PAYMENT: 'monthly-rent-payment',
  PAYMENT_REMINDER_EMAIL: 'payment-reminder-email',
  OVERDUE_PAYMENT_NOTIFICATION: 'overdue-payment-notification',
  AUTO_PAY_PROCESSING: 'auto-pay-processing',
  JOB_HEALTH_CHECK: 'job-health-check',
  PAYMENT_ANALYTICS: 'payment-analytics',
} as const

export const CRON_EXPRESSIONS = {
  DAILY_8AM: '0 8 * * *',
  DAILY_9AM: '0 9 * * *',
  DAILY_10AM: '0 10 * * *',
  DAILY_11PM: '0 23 * * *',
  MONTHLY_1ST_6AM: '0 6 1 * *',
  EVERY_5_MINUTES: '*/5 * * * *',
  EVERY_HOUR: '0 * * * *',
  EVERY_DAY_MIDNIGHT: '0 0 * * *',
} as const

export const QUEUE_NAMES = {
  PAYMENT_JOBS: 'payment-jobs',
  SYSTEM_JOBS: 'system-jobs',
  ANALYTICS_JOBS: 'analytics-jobs',
  EMAIL_JOBS: 'email-jobs',
  DEFAULT: 'default',
} as const
