import type { Payload } from 'payload'
import {
  isPaymentSystemEnabled,
  isAfterStartDate,
  isCustomerExcluded,
  areCustomerNotificationsEnabled,
  getCustomerReminderDays,
  createSuccessResult,
  createFailureResult,
  logJobExecution,
  isReminderDay,
} from './utils'
import type { PaymentReminderEmailJobData } from './types'
import { EmailRenderer } from '../../lib/email/rent-payments/renderer'
import type { RentDueReminderData } from '../../lib/email/rent-payments/types'

// Payment Reminder Email Job
// Sends payment reminder emails to customers
// Following PayloadCMS official documentation: https://payloadcms.com/docs/jobs-queue/jobs
export const paymentReminderEmailJob = {
  // Job metadata
  name: 'payment-reminder-email',
  description: 'Send payment reminder emails to customers',

  // Job execution function
  async run(payload: Payload, data: PaymentReminderEmailJobData) {
    const startTime = Date.now()

    logJobExecution('payment-reminder-email', 'started', {
      reminderDay: data.reminderDay,
      dueDate: data.dueDate,
    })

    try {
      // Check if payment system is enabled
      const systemEnabled = await isPaymentSystemEnabled(payload)
      if (!systemEnabled) {
        const result = createSuccessResult(
          'Payment system is disabled, skipping payment reminder emails',
          { systemEnabled: false },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('payment-reminder-email', 'completed', result)
        return result
      }

      // Check if we're past the start date
      const afterStartDate = await isAfterStartDate(payload)
      if (!afterStartDate) {
        const result = createSuccessResult(
          'Payment system start date not reached, skipping payment reminder emails',
          { afterStartDate: false },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('payment-reminder-email', 'completed', result)
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

        logJobExecution('payment-reminder-email', 'failed', result)
        return result
      }

      const paymentConfig = config.docs[0] as any
      const reminderDaysRaw = paymentConfig.reminderDays || [{ days: 7 }, { days: 3 }, { days: 1 }]
      const reminderDays = reminderDaysRaw
        .map((item: any) => item.days || item)
        .filter((day: any) => typeof day === 'number')

      // Find payments that are due soon and need reminders
      const currentDate = new Date()
      const dueDate = data.dueDate || new Date()

      // Find pending payments that are due within the reminder window
      const pendingPayments = await payload.find({
        collection: 'payments',
        where: {
          status: { equals: 'pending' },
          dueDate: {
            greater_than_equal: currentDate.toISOString(),
            less_than_equal: new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from due date
          },
          paymentType: { equals: 'rent' },
        },
        depth: 1,
      })

      if (!pendingPayments.docs || pendingPayments.docs.length === 0) {
        const result = createSuccessResult(
          'No pending payments found for reminder emails',
          { pendingPayments: 0 },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('payment-reminder-email', 'completed', result)
        return result
      }

      let recordsProcessed = 0
      let recordsFailed = 0
      const sentEmails: any[] = []
      const failedEmails: any[] = []

      // Process each pending payment
      for (const payment of pendingPayments.docs) {
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

          // Get customer-specific reminder days
          const customerReminderDays = await getCustomerReminderDays(payload, customerId)

          // Check if today is a reminder day for this payment
          const paymentDueDate = new Date(payment.dueDate)
          const isReminderDayForPayment = isReminderDay(
            paymentDueDate,
            customerReminderDays,
            currentDate,
          )

          if (!isReminderDayForPayment) {
            console.log(`Today is not a reminder day for payment ${payment.id}`)
            continue
          }

          // Check if reminder was already sent recently
          const lastReminderSent = (payment as any).lastReminderSent
          if (lastReminderSent) {
            const daysSinceLastReminder = Math.ceil(
              (currentDate.getTime() - new Date(lastReminderSent).getTime()) /
                (1000 * 60 * 60 * 24),
            )

            // Don't send reminder if one was sent within the last 2 days
            if (daysSinceLastReminder < 2) {
              console.log(`Reminder already sent recently for payment ${payment.id}`)
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
            failedEmails.push({
              paymentId: payment.id,
              customerId,
              error: 'Customer not found',
            })
            recordsFailed++
            continue
          }

          // Prepare email data using new template system
          const daysRemaining = Math.ceil(
            (paymentDueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
          )

          const emailTemplateData: RentDueReminderData = {
            customerName: customer.name,
            customerEmail: customer.email,
            paymentAmount: payment.amount,
            dueDate: paymentDueDate,
            paymentType: 'rent',
            daysRemaining,
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
            template: 'rentDueReminder',
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

            // Update payment record with reminder sent info
            await payload.update({
              collection: 'payments',
              id: payment.id,
              data: {
                // Note: These fields need to be added to the Payment collection
                // For now, we'll use a custom field or notes
                notes: `Reminder sent on ${currentDate.toISOString()}`,
              } as any,
            })

            sentEmails.push({
              paymentId: payment.id,
              customerId,
              customerEmail: customer.email,
              reminderCount: 1, // Simplified for now
            })

            recordsProcessed++
            console.log(`Sent reminder email for payment ${payment.id} to ${customer.email}`)
          } catch (emailError) {
            console.error(`Error sending email for payment ${payment.id}:`, emailError)
            failedEmails.push({
              paymentId: payment.id,
              customerId,
              customerEmail: customer.email,
              error: emailError instanceof Error ? emailError.message : 'Email sending failed',
            })
            recordsFailed++
          }
        } catch (error) {
          console.error(`Error processing payment ${payment.id}:`, error)
          const customerId =
            typeof payment.customer === 'string'
              ? payment.customer
              : payment.customer?.id || 'unknown'
          failedEmails.push({
            paymentId: payment.id,
            customerId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          recordsFailed++
        }
      }

      const result = createSuccessResult(
        `Payment reminder emails completed. Sent: ${recordsProcessed}, Failed: ${recordsFailed}`,
        {
          reminderDay: data.reminderDay,
          dueDate: data.dueDate,
          pendingPayments: pendingPayments.docs.length,
          sentEmails: sentEmails.length,
          failedEmails: failedEmails.length,
          failedDetails: failedEmails,
        },
        recordsProcessed,
      )
      result.executionTime = Date.now() - startTime
      result.recordsFailed = recordsFailed

      logJobExecution('payment-reminder-email', 'completed', result)
      return result
    } catch (error) {
      const result = createFailureResult(
        'Payment reminder email job failed',
        error instanceof Error ? error : new Error('Unknown error'),
        0,
        0,
      )
      result.executionTime = Date.now() - startTime

      logJobExecution('payment-reminder-email', 'failed', result)
      return result
    }
  },
}
