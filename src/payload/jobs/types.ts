import type { PayloadRequest } from 'payload'

// Job execution context
export interface JobContext {
  req: PayloadRequest
  payload: any
  collection: string
  jobId: string
  startedAt: Date
}

// Payment configuration types
export interface PaymentConfig {
  id: string
  isEnabled: boolean
  startDate: Date
  monthlyPaymentDay: number
  reminderDays: number[]
  overdueCheckDays: number[]
  excludedCustomers: string[]
  autoPayEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

// Customer payment settings types
export interface CustomerPaymentSettings {
  id: string
  customer: string
  notificationsEnabled: boolean
  excludedFromSystem: boolean
  customReminderDays: number[]
  autoPayEnabled: boolean
  createdAt: Date
  updatedAt: Date
}

// Job result types
export interface JobResult {
  success: boolean
  message: string
  data?: any
  error?: Error
  executionTime: number
  recordsProcessed: number
  recordsFailed: number
}

// Monthly rent payment job data
export interface MonthlyRentPaymentJobData {
  month: number
  year: number
  forceRun?: boolean
}

// Payment reminder email job data
export interface PaymentReminderEmailJobData {
  reminderDay: number
  dueDate: Date
}

// Overdue payment notification job data
export interface OverduePaymentNotificationJobData {
  overdueDay: number
  dueDate: Date
}

// Auto-pay processing job data
export interface AutoPayProcessingJobData {
  customerId?: string
  forceRun?: boolean
}

// Job status types
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

// Job execution log
export interface JobExecutionLog {
  jobId: string
  jobName: string
  status: JobStatus
  startedAt: Date
  completedAt?: Date
  executionTime?: number
  result?: JobResult
  error?: string
  stackTrace?: string
}

// Email notification data
export interface EmailNotificationData {
  customerId: string
  customerEmail: string
  customerName: string
  paymentId: string
  amount: number
  dueDate: Date
  paymentType: 'rent' | 'food' | 'deposit' | 'other'
  template: 'reminder' | 'overdue' | 'confirmation' | 'failure'
  customData?: Record<string, any>
}

// Payment record data for job processing
export interface PaymentRecordData {
  id: string
  customer: string
  amount: number
  dueDate: Date
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'overdue'
  paymentType: 'rent' | 'food' | 'deposit' | 'other'
  bookingId?: string
  autoPayEnabled: boolean
  lastReminderSent?: Date
  reminderCount: number
}
