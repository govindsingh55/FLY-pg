// Job registry for FLY PG payment system
// This file exports all payment-related jobs for Payload to register

import type { Job } from 'payload'

// Import job definitions (will be created in next tasks)
// import { monthlyRentPaymentJob } from './monthly-rent-payment.job'
// import { paymentReminderEmailJob } from './payment-reminder-email.job'
// import { overduePaymentNotificationJob } from './overdue-payment-notification.job'
// import { autoPayProcessingJob } from './auto-pay-processing.job'

// Export all jobs for Payload to register
export const paymentJobs: Record<string, Job> = {
  // 'monthly-rent-payment': monthlyRentPaymentJob,
  // 'payment-reminder-email': paymentReminderEmailJob,
  // 'overdue-payment-notification': overduePaymentNotificationJob,
  // 'auto-pay-processing': autoPayProcessingJob,
}

// Export individual jobs for direct import if needed
// export { monthlyRentPaymentJob }
// export { paymentReminderEmailJob }
// export { overduePaymentNotificationJob }
// export { autoPayProcessingJob }

// Export types and utilities
export * from './types'
export * from './utils'
