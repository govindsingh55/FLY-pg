import type { Payload } from 'payload'
import {
  isPaymentSystemEnabled,
  isAfterStartDate,
  isCustomerExcluded,
  createSuccessResult,
  createFailureResult,
  logJobExecution,
} from './utils'
import type { AutoPayProcessingJobData } from './types'
import { EmailRenderer } from '../../lib/email/rent-payments/renderer'
import type { AutoPayStatusData } from '../../lib/email/rent-payments/types'

// Auto-Pay Processing Job
// Processes automatic payments for customers with auto-pay enabled
// Following PayloadCMS official documentation: https://payloadcms.com/docs/jobs-queue/jobs
export const autoPayProcessingJob = {
  // Job metadata
  name: 'auto-pay-processing',
  description: 'Process automatic payments for customers with auto-pay enabled',

  // Job execution function
  async run(payload: Payload, data: AutoPayProcessingJobData) {
    const startTime = Date.now()

    logJobExecution('auto-pay-processing', 'started', {
      customerId: data.customerId,
      forceRun: data.forceRun,
    })

    try {
      // Check if payment system is enabled
      const systemEnabled = await isPaymentSystemEnabled(payload)
      if (!systemEnabled && !data.forceRun) {
        const result = createSuccessResult(
          'Payment system is disabled, skipping auto-pay processing',
          { systemEnabled: false },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('auto-pay-processing', 'completed', result)
        return result
      }

      // Check if we're past the start date
      const afterStartDate = await isAfterStartDate(payload)
      if (!afterStartDate && !data.forceRun) {
        const result = createSuccessResult(
          'Payment system start date not reached, skipping auto-pay processing',
          { afterStartDate: false },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('auto-pay-processing', 'completed', result)
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

        logJobExecution('auto-pay-processing', 'failed', result)
        return result
      }

      const paymentConfig = config.docs[0] as any

      // Check if auto-pay is enabled globally
      if (!paymentConfig.autoPayEnabled && !data.forceRun) {
        const result = createSuccessResult(
          'Auto-pay is disabled globally, skipping auto-pay processing',
          { autoPayEnabled: false },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('auto-pay-processing', 'completed', result)
        return result
      }

      // Find customers with auto-pay enabled
      let autoPayCustomers

      if (data.customerId) {
        // Process specific customer
        const customer = await payload.findByID({
          collection: 'customers',
          id: data.customerId,
        })

        if (!customer || !customer.autoPayEnabled) {
          const result = createSuccessResult(
            'Customer not found or auto-pay not enabled',
            { customerId: data.customerId, autoPayEnabled: false },
            0,
          )
          result.executionTime = Date.now() - startTime

          logJobExecution('auto-pay-processing', 'completed', result)
          return result
        }

        autoPayCustomers = { docs: [customer] }
      } else {
        // Find all customers with auto-pay enabled
        autoPayCustomers = await payload.find({
          collection: 'customers',
          where: {
            autoPayEnabled: { equals: true },
          },
          depth: 1,
        })
      }

      if (!autoPayCustomers.docs || autoPayCustomers.docs.length === 0) {
        const result = createSuccessResult(
          'No customers with auto-pay enabled found',
          { autoPayCustomers: 0 },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('auto-pay-processing', 'completed', result)
        return result
      }

      let recordsProcessed = 0
      let recordsFailed = 0
      const processedPayments: any[] = []
      const failedPayments: any[] = []

      // Process each customer with auto-pay enabled
      for (const customer of autoPayCustomers.docs) {
        try {
          // Check if customer is excluded
          const customerExcluded = await isCustomerExcluded(payload, customer.id)
          if (customerExcluded) {
            console.log(`Customer ${customer.id} is excluded from payment processing`)
            continue
          }

          // Check if customer has valid auto-pay settings
          if (!customer.autoPayPaymentMethod || !customer.autoPayDay) {
            console.log(`Customer ${customer.id} has incomplete auto-pay settings`)
            continue
          }

          // Check if today is the customer's auto-pay day
          const currentDate = new Date()
          const currentDay = currentDate.getDate()

          if (currentDay !== customer.autoPayDay && !data.forceRun) {
            console.log(`Today is not auto-pay day for customer ${customer.id}`)
            continue
          }

          // Find pending payments for this customer
          const pendingPayments = await payload.find({
            collection: 'payments',
            where: {
              customer: { equals: customer.id },
              status: { equals: 'pending' },
              paymentType: { equals: 'rent' },
            },
            depth: 1,
          })

          if (!pendingPayments.docs || pendingPayments.docs.length === 0) {
            console.log(`No pending payments found for customer ${customer.id}`)
            continue
          }

          // Process each pending payment
          for (const payment of pendingPayments.docs) {
            try {
              // Check if payment amount is within auto-pay limit
              if (customer.autoPayMaxAmount && payment.amount > customer.autoPayMaxAmount) {
                console.log(
                  `Payment amount ${payment.amount} exceeds auto-pay limit ${customer.autoPayMaxAmount} for customer ${customer.id}`,
                )
                continue
              }

              // Check if payment is not too overdue (within 7 days)
              const paymentDueDate = new Date(payment.dueDate)
              const daysOverdue = Math.ceil(
                (currentDate.getTime() - paymentDueDate.getTime()) / (1000 * 60 * 60 * 24),
              )

              if (daysOverdue > 7) {
                console.log(
                  `Payment ${payment.id} is too overdue (${daysOverdue} days) for auto-pay processing`,
                )
                continue
              }

              // Update payment status to processing
              await payload.update({
                collection: 'payments',
                id: payment.id,
                data: {
                  status: 'processing',
                  autoPayEnabled: true,
                  // Note: autoPayProcessedAt field needs to be added to Payment collection
                  notes: `Auto-pay processing started on ${currentDate.toISOString()}`,
                } as any,
              })

              // TODO: Integrate with PhonePe payment gateway
              // For now, we'll simulate a successful payment
              console.log(
                `Processing auto-pay for payment ${payment.id} - Amount: ₹${payment.amount}`,
              )

              // Simulate payment processing delay
              await new Promise((resolve) => setTimeout(resolve, 1000))

              // Update payment status to completed (simulated success)
              await payload.update({
                collection: 'payments',
                id: payment.id,
                data: {
                  status: 'completed',
                  // Note: completedAt field needs to be added to Payment collection
                  notes: `Auto-pay processed on ${currentDate.toLocaleDateString()}`,
                } as any,
              })

              // Send confirmation email if enabled
              if (customer.autoPayNotifications !== false) {
                try {
                  const emailTemplateData: AutoPayStatusData = {
                    customerName: customer.name,
                    customerEmail: customer.email,
                    paymentAmount: payment.amount,
                    dueDate: paymentDueDate,
                    paymentType: 'rent',
                    status: 'success',
                    processedDate: currentDate,
                    nextAutoPayDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000), // Next month
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
                    template: 'autoPayStatus',
                  })

                  const emailData = {
                    to: customer.email,
                    subject: emailTemplate.subject,
                    html: emailTemplate.html,
                    text: emailTemplate.text,
                  }

                  await payload.sendEmail(emailData)
                  console.log(`Sent auto-pay confirmation email to ${customer.email}`)
                } catch (emailError) {
                  console.error(
                    `Error sending auto-pay confirmation email to ${customer.email}:`,
                    emailError,
                  )
                }
              }

              processedPayments.push({
                paymentId: payment.id,
                customerId: customer.id,
                amount: payment.amount,
                dueDate: payment.dueDate,
              })

              recordsProcessed++
              console.log(`Successfully processed auto-pay for payment ${payment.id}`)
            } catch (error) {
              console.error(`Error processing auto-pay for payment ${payment.id}:`, error)

              // Revert payment status to pending on error
              try {
                await payload.update({
                  collection: 'payments',
                  id: payment.id,
                  data: {
                    status: 'pending',
                    autoPayEnabled: false,
                  },
                })
              } catch (revertError) {
                console.error(`Error reverting payment status for ${payment.id}:`, revertError)
              }

              failedPayments.push({
                paymentId: payment.id,
                customerId: customer.id,
                error: error instanceof Error ? error.message : 'Unknown error',
              })
              recordsFailed++
            }
          }
        } catch (error) {
          console.error(`Error processing customer ${customer.id}:`, error)
          failedPayments.push({
            customerId: customer.id,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          recordsFailed++
        }
      }

      const result = createSuccessResult(
        `Auto-pay processing completed. Processed: ${recordsProcessed}, Failed: ${recordsFailed}`,
        {
          customerId: data.customerId,
          forceRun: data.forceRun,
          autoPayCustomers: autoPayCustomers.docs.length,
          processedPayments: processedPayments.length,
          failedPayments: failedPayments.length,
          failedDetails: failedPayments,
        },
        recordsProcessed,
      )
      result.executionTime = Date.now() - startTime
      result.recordsFailed = recordsFailed

      logJobExecution('auto-pay-processing', 'completed', result)
      return result
    } catch (error) {
      const result = createFailureResult(
        'Auto-pay processing job failed',
        error instanceof Error ? error : new Error('Unknown error'),
        0,
        0,
      )
      result.executionTime = Date.now() - startTime

      logJobExecution('auto-pay-processing', 'failed', result)
      return result
    }
  },
}
