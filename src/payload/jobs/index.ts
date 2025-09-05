// Job registry for FLY PG payment system
// This file exports all payment-related jobs for Payload to register
// Following PayloadCMS official documentation: https://payloadcms.com/docs/jobs-queue/jobs

// Import job definitions
import { monthlyRentPaymentJob } from './monthly-rent-payment.job'
import { paymentReminderEmailJob } from './payment-reminder-email.job'
import { overduePaymentNotificationJob } from './overdue-payment-notification.job'
import { autoPayProcessingJob } from './auto-pay-processing.job'
import { jobHealthCheckJob } from './monitoring'
import { paymentAnalyticsJob } from './analytics'

// Export all jobs for Payload to register
// These will be used in payload.config.ts jobs section
export const paymentJobs = {
  'monthly-rent-payment': monthlyRentPaymentJob,
  'payment-reminder-email': paymentReminderEmailJob,
  'overdue-payment-notification': overduePaymentNotificationJob,
  'auto-pay-processing': autoPayProcessingJob,
  'job-health-check': jobHealthCheckJob,
  'payment-analytics': paymentAnalyticsJob,
}

// Export individual jobs for direct import if needed
export { monthlyRentPaymentJob }
export { paymentReminderEmailJob }
export { overduePaymentNotificationJob }
export { autoPayProcessingJob }
export { jobHealthCheckJob }
export { paymentAnalyticsJob }

// Export types and utilities
export * from './types'
export * from './utils'
export * from './scheduling'
export * from './monitoring'
export * from './analytics'
export { JobLogger, JobLoggingUtils } from './logging'
export type { JobExecutionLog, JobLogFilter, JobLogStats } from './logging'
