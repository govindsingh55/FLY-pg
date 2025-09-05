// Email types for rent payment notifications
// Following PayloadCMS email system integration

export interface EmailTemplateData {
  customerName: string
  customerEmail: string
  paymentAmount: number
  dueDate: Date
  paymentType: 'rent' | 'food' | 'deposit' | 'other'
  daysRemaining?: number
  daysOverdue?: number
  urgencyLevel?: 'low' | 'medium' | 'high' | 'critical'
  paymentId: string
  bookingDetails?: {
    property: string
    room: string
    startDate: Date
    endDate: Date
  }
  customData?: Record<string, any>
}

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface EmailNotificationData extends EmailTemplateData {
  template:
    | 'rentDueReminder'
    | 'paymentConfirmation'
    | 'overdueNotification'
    | 'autoPayStatus'
    | 'paymentFailure'
}

export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Template-specific data interfaces
export interface RentDueReminderData extends EmailTemplateData {
  daysRemaining: number
}

export interface PaymentConfirmationData extends EmailTemplateData {
  processedDate: Date
  paymentMethod: string
  transactionId?: string
}

export interface OverdueNotificationData extends EmailTemplateData {
  daysOverdue: number
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical'
  lateFees?: number
}

export interface AutoPayStatusData extends EmailTemplateData {
  status: 'success' | 'failed' | 'processing'
  processedDate: Date
  nextAutoPayDate?: Date
  failureReason?: string
}

export interface PaymentFailureData extends EmailTemplateData {
  failureReason: string
  retryDate?: Date
  supportContact: string
}
