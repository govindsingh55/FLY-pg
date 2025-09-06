import type { Payload } from 'payload'
import {
  isPaymentSystemEnabled,
  isAfterStartDate,
  isCustomerExcluded,
  areCustomerNotificationsEnabled,
  createSuccessResult,
  createFailureResult,
  logJobExecution,
  isPaymentOverdue,
} from './utils'
import type { OverduePaymentNotificationJobData } from './types'
import { EmailRenderer } from '../../lib/email/rent-payments/renderer'
import type { OverdueNotificationData } from '../../lib/email/rent-payments/types'

// Overdue Payment Notification Job
// Sends overdue payment notifications to customers
// Following PayloadCMS official documentation: https://payloadcms.com/docs/jobs-queue/jobs
export const overduePaymentNotificationJob = {
  // Job metadata
  name: 'overdue-payment-notification',
  description: 'Send overdue payment notifications to customers',

  // Job execution function
  async run(payload: Payload, data: OverduePaymentNotificationJobData) {
    const startTime = Date.now()

    logJobExecution('overdue-payment-notification', 'started', {
      overdueDay: data.overdueDay,
      dueDate: data.dueDate,
    })

    try {
      // Check if payment system is enabled
      const systemEnabled = await isPaymentSystemEnabled(payload)
      if (!systemEnabled) {
        const result = createSuccessResult(
          'Payment system is disabled, skipping overdue payment notifications',
          { systemEnabled: false },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('overdue-payment-notification', 'completed', result)
        return result
      }

      // Check if we're past the start date
      const afterStartDate = await isAfterStartDate(payload)
      if (!afterStartDate) {
        const result = createSuccessResult(
          'Payment system start date not reached, skipping overdue payment notifications',
          { afterStartDate: false },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('overdue-payment-notification', 'completed', result)
        return result
      }

      // Get payment configuration
      const config = await payload.find({
        collection: 'payment-configs' as any,
        limit: 1,
        sort: '-createdAt',
      })

      if (!config.docs || config.docs.length === 0) {
        const result = createFailureResult(
          'No payment configuration found',
          new Error('Payment configuration not found'),
          0,
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('overdue-payment-notification', 'failed', result)
        return result
      }

      const paymentConfig = config.docs[0] as any
      const overdueCheckDaysRaw = paymentConfig.overdueCheckDays || [
        { days: 1 },
        { days: 3 },
        { days: 7 },
        { days: 15 },
        { days: 30 },
      ]
      const overdueCheckDays = overdueCheckDaysRaw
        .map((item: any) => item.days || item)
        .filter((day: any) => typeof day === 'number')

      // Find overdue payments
      const currentDate = new Date()
      const dueDate = data.dueDate || new Date()

      // Find pending payments that are overdue
      const overduePayments = await payload.find({
        collection: 'payments',
        where: {
          status: { equals: 'pending' },
          dueDate: { less_than: currentDate.toISOString() },
          paymentType: { equals: 'rent' },
        },
        depth: 1,
      })

      if (!overduePayments.docs || overduePayments.docs.length === 0) {
        const result = createSuccessResult('No overdue payments found', { overduePayments: 0 }, 0)
        result.executionTime = Date.now() - startTime

        logJobExecution('overdue-payment-notification', 'completed', result)
        return result
      }

      let recordsProcessed = 0
      let recordsFailed = 0
      const sentNotifications: any[] = []
      const failedNotifications: any[] = []

      // Process each overdue payment
      for (const payment of overduePayments.docs) {
        try {
          // Check if customer is excluded
          const customerId =
            typeof payment.customer === 'string' ? payment.customer : payment.customer.id
          const customerExcluded = await isCustomerExcluded(payload, customerId)
          if (customerExcluded) {
            console.log(`Customer ${customerId} is excluded from payment processing`)
            continue
          }

          // Check if customer notifications are enabled
          const notificationsEnabled = await areCustomerNotificationsEnabled(payload, customerId)
          if (!notificationsEnabled) {
            console.log(`Notifications disabled for customer ${customerId}`)
            continue
          }

          // Calculate days overdue
          const paymentDueDate = new Date(payment.dueDate)
          const daysOverdue = Math.ceil(
            (currentDate.getTime() - paymentDueDate.getTime()) / (1000 * 60 * 60 * 24),
          )

          // Check if today is an overdue check day for this payment
          const isOverdueCheckDay = isPaymentOverdue(paymentDueDate, overdueCheckDays, currentDate)

          if (!isOverdueCheckDay) {
            console.log(`Today is not an overdue check day for payment ${payment.id}`)
            continue
          }

          // Check if notification was already sent recently
          const lastOverdueNotification = (payment as any).lastOverdueNotification
          if (lastOverdueNotification) {
            const daysSinceLastNotification = Math.ceil(
              (currentDate.getTime() - new Date(lastOverdueNotification).getTime()) /
                (1000 * 60 * 60 * 24),
            )

            // Don't send notification if one was sent within the last 2 days
            if (daysSinceLastNotification < 2) {
              console.log(`Overdue notification already sent recently for payment ${payment.id}`)
              continue
            }
          }

          // Get customer details
          const customer = await payload.findByID({
            collection: 'customers',
            id: customerId,
          })

          if (!customer) {
            console.error(`Customer not found for payment ${payment.id}`)
            failedNotifications.push({
              paymentId: payment.id,
              customerId,
              error: 'Customer not found',
            })
            recordsFailed++
            continue
          }

          // Determine urgency level and message based on days overdue
          let urgencyLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
          let subjectPrefix = 'Payment Overdue'
          let messageContent = 'Your rent payment is overdue.'

          if (daysOverdue >= 30) {
            urgencyLevel = 'critical'
            subjectPrefix = 'URGENT: Payment Severely Overdue'
            messageContent =
              'Your rent payment is severely overdue and requires immediate attention.'
          } else if (daysOverdue >= 15) {
            urgencyLevel = 'high'
            subjectPrefix = 'Important: Payment Overdue'
            messageContent = 'Your rent payment is significantly overdue.'
          } else if (daysOverdue >= 7) {
            urgencyLevel = 'medium'
            subjectPrefix = 'Payment Overdue'
            messageContent = 'Your rent payment is overdue.'
          }

          // Prepare email data using new template system
          const emailTemplateData: OverdueNotificationData = {
            customerName: customer.name,
            customerEmail: customer.email,
            paymentAmount: payment.amount,
            dueDate: paymentDueDate,
            paymentType: 'rent',
            daysOverdue,
            urgencyLevel,
            paymentId: payment.id,
            bookingDetails: (payment as any).booking
              ? {
                  property: (payment as any).booking.property?.name || 'Unknown Property',
                  room: (payment as any).booking.room || 'Unknown Room',
                  startDate: new Date((payment as any).booking.startDate),
                  endDate: new Date((payment as any).booking.endDate),
                }
              : undefined,
          }

          // Generate email template
          const emailTemplate = EmailRenderer.renderTemplate({
            ...emailTemplateData,
            template: 'overdueNotification',
          })

          const emailData = {
            to: customer.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: emailTemplate.text,
          }

          // Send email using Payload's email system
          try {
            await payload.sendEmail(emailData)

            // Update payment record with overdue notification info
            await payload.update({
              collection: 'payments',
              id: payment.id,
              data: {
                // Note: These fields need to be added to the Payment collection
                // For now, we'll use a custom field or notes
                notes: `Overdue notification sent on ${currentDate.toISOString()}`,
              } as any,
            })

            sentNotifications.push({
              paymentId: payment.id,
              customerId,
              customerEmail: customer.email,
              daysOverdue,
              urgencyLevel,
              overdueNotificationCount: 1, // Simplified for now
            })

            recordsProcessed++
            console.log(
              `Sent overdue notification for payment ${payment.id} to ${customer.email} (${daysOverdue} days overdue)`,
            )
          } catch (emailError) {
            console.error(
              `Error sending overdue notification for payment ${payment.id}:`,
              emailError,
            )
            failedNotifications.push({
              paymentId: payment.id,
              customerId,
              customerEmail: customer.email,
              error: emailError instanceof Error ? emailError.message : 'Email sending failed',
            })
            recordsFailed++
          }
        } catch (error) {
          console.error(`Error processing overdue payment ${payment.id}:`, error)
          const customerId =
            typeof payment.customer === 'string'
              ? payment.customer
              : payment.customer?.id || 'unknown'
          failedNotifications.push({
            paymentId: payment.id,
            customerId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          recordsFailed++
        }
      }

      const result = createSuccessResult(
        `Overdue payment notifications completed. Sent: ${recordsProcessed}, Failed: ${recordsFailed}`,
        {
          overdueDay: data.overdueDay,
          dueDate: data.dueDate,
          overduePayments: overduePayments.docs.length,
          sentNotifications: sentNotifications.length,
          failedNotifications: failedNotifications.length,
          failedDetails: failedNotifications,
        },
        recordsProcessed,
      )
      result.executionTime = Date.now() - startTime
      result.recordsFailed = recordsFailed

      logJobExecution('overdue-payment-notification', 'completed', result)
      return result
    } catch (error) {
      const result = createFailureResult(
        'Overdue payment notification job failed',
        error instanceof Error ? error : new Error('Unknown error'),
        0,
        0,
      )
      result.executionTime = Date.now() - startTime

      logJobExecution('overdue-payment-notification', 'failed', result)
      return result
    }
  },
}
