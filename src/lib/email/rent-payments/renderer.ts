// Email rendering system for rent payment notifications
// Following PayloadCMS email system integration

import type { EmailNotificationData, EmailResult, EmailTemplate } from './types'
import { generateRentDueReminderEmail } from './rentDueReminder'
import { generatePaymentConfirmationEmail } from './paymentConfirmation'
import { generateOverdueNotificationEmail } from './overdueNotification'
import { generateAutoPayStatusEmail } from './autoPayStatus'
import { generatePaymentFailureEmail } from './paymentFailure'

/**
 * Email Template Renderer
 * Renders appropriate email template based on notification type
 */
export class EmailRenderer {
  /**
   * Render email template based on notification data
   */
  static renderTemplate(data: EmailNotificationData): EmailTemplate {
    switch (data.template) {
      case 'rentDueReminder':
        return generateRentDueReminderEmail(data as any)

      case 'paymentConfirmation':
        return generatePaymentConfirmationEmail(data as any)

      case 'overdueNotification':
        return generateOverdueNotificationEmail(data as any)

      case 'autoPayStatus':
        return generateAutoPayStatusEmail(data as any)

      case 'paymentFailure':
        return generatePaymentFailureEmail(data as any)

      default:
        throw new Error(`Unknown email template: ${data.template}`)
    }
  }

  /**
   * Validate email data before rendering
   */
  static validateEmailData(data: EmailNotificationData): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Required fields validation
    if (!data.customerName) errors.push('Customer name is required')
    if (!data.customerEmail) errors.push('Customer email is required')
    if (!data.paymentAmount || data.paymentAmount <= 0)
      errors.push('Valid payment amount is required')
    if (!data.dueDate) errors.push('Due date is required')
    if (!data.paymentId) errors.push('Payment ID is required')
    if (!data.template) errors.push('Email template is required')

    // Email format validation
    if (data.customerEmail && !this.isValidEmail(data.customerEmail)) {
      errors.push('Invalid email format')
    }

    // Template-specific validation
    switch (data.template) {
      case 'rentDueReminder':
        if (!data.daysRemaining || data.daysRemaining < 0) {
          errors.push('Days remaining is required for rent due reminder')
        }
        break

      case 'overdueNotification':
        if (!data.daysOverdue || data.daysOverdue < 0) {
          errors.push('Days overdue is required for overdue notification')
        }
        if (!data.urgencyLevel) {
          errors.push('Urgency level is required for overdue notification')
        }
        break

      case 'autoPayStatus':
        if (!(data as any).status) {
          errors.push('Auto-pay status is required for auto-pay status email')
        }
        break

      case 'paymentFailure':
        if (!(data as any).failureReason) {
          errors.push('Failure reason is required for payment failure email')
        }
        break
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate email address format
   */
  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * Sanitize email data to prevent XSS
   */
  static sanitizeEmailData(data: EmailNotificationData): EmailNotificationData {
    const sanitizeString = (str: string): string => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
    }

    return {
      ...data,
      customerName: sanitizeString(data.customerName),
      customerEmail: sanitizeString(data.customerEmail),
      paymentType: data.paymentType,
      paymentId: sanitizeString(data.paymentId),
      bookingDetails: data.bookingDetails
        ? {
            ...data.bookingDetails,
            property: sanitizeString(data.bookingDetails.property),
            room: sanitizeString(data.bookingDetails.room),
          }
        : undefined,
      customData: data.customData
        ? Object.fromEntries(
            Object.entries(data.customData).map(([key, value]) => [
              sanitizeString(key),
              typeof value === 'string' ? sanitizeString(value) : value,
            ]),
          )
        : undefined,
    }
  }

  /**
   * Generate email preview (for testing)
   */
  static generatePreview(data: EmailNotificationData): {
    subject: string
    html: string
    text: string
  } {
    const sanitizedData = this.sanitizeEmailData(data)
    const validation = this.validateEmailData(sanitizedData)

    if (!validation.valid) {
      throw new Error(`Invalid email data: ${validation.errors.join(', ')}`)
    }

    return this.renderTemplate(sanitizedData)
  }
}

/**
 * Email Template Utilities
 */
export class EmailTemplateUtils {
  /**
   * Format currency amount
   */
  static formatCurrency(amount: number, currency: string = 'INR'): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date, locale: string = 'en-IN'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  /**
   * Format date and time for display
   */
  static formatDateTime(date: Date, locale: string = 'en-IN'): string {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  /**
   * Get urgency level color
   */
  static getUrgencyColor(urgencyLevel: 'low' | 'medium' | 'high' | 'critical'): string {
    const colors = {
      low: '#007bff',
      medium: '#ffc107',
      high: '#fd7e14',
      critical: '#dc3545',
    }
    return colors[urgencyLevel]
  }

  /**
   * Get status color
   */
  static getStatusColor(status: 'success' | 'failed' | 'processing'): string {
    const colors = {
      success: '#28a745',
      failed: '#dc3545',
      processing: '#007bff',
    }
    return colors[status]
  }

  /**
   * Generate email tracking pixel (for analytics)
   */
  static generateTrackingPixel(emailId: string, baseUrl: string): string {
    return `<img src="${baseUrl}/api/email/track/${emailId}" width="1" height="1" style="display:none;" alt="" />`
  }

  /**
   * Generate unsubscribe link
   */
  static generateUnsubscribeLink(customerId: string, baseUrl: string): string {
    return `${baseUrl}/unsubscribe?customer=${customerId}&type=payment-notifications`
  }
}

/**
 * Email Template Constants
 */
export const EMAIL_TEMPLATES = {
  RENT_DUE_REMINDER: 'rentDueReminder',
  PAYMENT_CONFIRMATION: 'paymentConfirmation',
  OVERDUE_NOTIFICATION: 'overdueNotification',
  AUTO_PAY_STATUS: 'autoPayStatus',
  PAYMENT_FAILURE: 'paymentFailure',
} as const

export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const

export const PAYMENT_STATUS = {
  SUCCESS: 'success',
  FAILED: 'failed',
  PROCESSING: 'processing',
} as const
