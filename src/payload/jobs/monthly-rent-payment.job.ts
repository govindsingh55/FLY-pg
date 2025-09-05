import type { Payload } from 'payload'
import {
  isPaymentSystemEnabled,
  isAfterStartDate,
  isCustomerExcluded,
  createSuccessResult,
  createFailureResult,
  logJobExecution,
  calculateNextPaymentDueDate,
} from './utils'
import { JobLogger } from './logging'
import type { MonthlyRentPaymentJobData } from './types'

// Monthly Rent Payment Job
// Creates monthly rent payments for all active bookings
// Following PayloadCMS official documentation: https://payloadcms.com/docs/jobs-queue/jobs
export const monthlyRentPaymentJob = {
  // Job metadata
  name: 'monthly-rent-payment',
  description: 'Create monthly rent payments for all active bookings',

  // Job execution function
  async run(payload: Payload, data: MonthlyRentPaymentJobData) {
    const startTime = Date.now()
    const jobId = `monthly-rent-${data.year}-${data.month}-${Date.now()}`

    // Log job start
    const logEntry = await JobLogger.logJobStart(
      payload,
      'monthly-rent-payment',
      jobId,
      {
        month: data.month,
        year: data.year,
        forceRun: data.forceRun,
      },
      'default',
      1,
    )

    logJobExecution('monthly-rent-payment', 'started', {
      month: data.month,
      year: data.year,
      forceRun: data.forceRun,
    })

    try {
      // Check if payment system is enabled
      const systemEnabled = await isPaymentSystemEnabled(payload)
      if (!systemEnabled && !data.forceRun) {
        const result = createSuccessResult(
          'Payment system is disabled, skipping monthly rent payment creation',
          { systemEnabled: false },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('monthly-rent-payment', 'completed', result)
        return result
      }

      // Check if we're past the start date
      const afterStartDate = await isAfterStartDate(payload)
      if (!afterStartDate && !data.forceRun) {
        const result = createSuccessResult(
          'Payment system start date not reached, skipping monthly rent payment creation',
          { afterStartDate: false },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('monthly-rent-payment', 'completed', result)
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

        logJobExecution('monthly-rent-payment', 'failed', result)
        return result
      }

      const paymentConfig = config.docs[0] as any
      const monthlyPaymentDay = paymentConfig.monthlyPaymentDay || 1

      // Calculate the payment due date for this month
      const paymentDueDate = calculateNextPaymentDueDate(
        monthlyPaymentDay,
        new Date(data.year, data.month - 1, 1),
      )

      // Find all active bookings
      const activeBookings = await payload.find({
        collection: 'bookings',
        where: {
          status: { equals: 'confirmed' },
          startDate: { less_than_equal: paymentDueDate },
          endDate: { greater_than_equal: paymentDueDate },
        },
        depth: 1,
      })

      if (!activeBookings.docs || activeBookings.docs.length === 0) {
        const result = createSuccessResult(
          'No active bookings found for monthly rent payment creation',
          { activeBookings: 0 },
          0,
        )
        result.executionTime = Date.now() - startTime

        logJobExecution('monthly-rent-payment', 'completed', result)
        return result
      }

      let recordsProcessed = 0
      let recordsFailed = 0
      const createdPayments: any[] = []
      const failedPayments: any[] = []

      // Process each active booking
      for (const booking of activeBookings.docs) {
        try {
          // Check if customer is excluded
          const customerId =
            typeof booking.customer === 'string' ? booking.customer : booking.customer.id
          const customerExcluded = await isCustomerExcluded(payload, customerId)
          if (customerExcluded) {
            console.log(`Customer ${customerId} is excluded from payment processing`)
            continue
          }

          // Check if payment already exists for this month
          const existingPayment = await payload.find({
            collection: 'payments',
            where: {
              customer: { equals: customerId },
              payfor: { equals: booking.id },
              paymentForMonthAndYear: {
                equals: `${data.year}-${data.month.toString().padStart(2, '0')}`,
              },
              status: { not_equals: 'cancelled' },
            },
            limit: 1,
          })

          if (existingPayment.docs && existingPayment.docs.length > 0) {
            console.log(
              `Payment already exists for customer ${customerId} for ${data.year}-${data.month}`,
            )
            continue
          }

          // Calculate rent amount (basic rent from booking)
          const rentAmount = booking.price || 0

          // Create monthly rent payment record
          const paymentData = {
            customer: customerId,
            payfor: booking.id,
            amount: rentAmount,
            paymentForMonthAndYear: `${data.year}-${data.month.toString().padStart(2, '0')}`,
            dueDate: paymentDueDate.toISOString(),
            status: 'pending' as const,
            paymentType: 'rent' as const,
            autoPayEnabled: false, // Will be updated based on customer settings
            notes: `Monthly rent payment for ${data.year}-${data.month}`,
            bookingSnapshot: {
              property: booking.property,
              room: booking.room,
              startDate: booking.startDate,
              endDate: booking.endDate,
              price: booking.price,
            },
          }

          const createdPayment = await payload.create({
            collection: 'payments',
            data: paymentData,
          })

          createdPayments.push(createdPayment)
          recordsProcessed++

          console.log(
            `Created monthly rent payment for customer ${customerId}: ${createdPayment.id}`,
          )
        } catch (error) {
          console.error(`Error processing booking ${booking.id}:`, error)
          const customerId =
            typeof booking.customer === 'string'
              ? booking.customer
              : booking.customer?.id || 'unknown'
          failedPayments.push({
            bookingId: booking.id,
            customerId,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          recordsFailed++
        }
      }

      // Update payment configuration with last run time
      try {
        await payload.update({
          collection: 'payment-configs' as any,
          id: paymentConfig.id,
          data: {
            'systemStatus.lastJobRun': new Date(),
          },
        })
      } catch (error) {
        console.error('Error updating payment config last run time:', error)
      }

      const result = createSuccessResult(
        `Monthly rent payment creation completed. Processed: ${recordsProcessed}, Failed: ${recordsFailed}`,
        {
          month: data.month,
          year: data.year,
          paymentDueDate,
          activeBookings: activeBookings.docs.length,
          createdPayments: createdPayments.length,
          failedPayments: failedPayments.length,
          failedDetails: failedPayments,
        },
        recordsProcessed,
      )
      result.executionTime = Date.now() - startTime
      result.recordsFailed = recordsFailed

      // Log job completion
      await JobLogger.logJobCompletion(payload, logEntry, true, result, undefined)

      logJobExecution('monthly-rent-payment', 'completed', result)
      return result
    } catch (error) {
      const result = createFailureResult(
        'Monthly rent payment job failed',
        error instanceof Error ? error : new Error('Unknown error'),
        0,
        0,
      )
      result.executionTime = Date.now() - startTime

      // Log job failure
      await JobLogger.logJobCompletion(
        payload,
        logEntry,
        false,
        result,
        error instanceof Error ? error.message : 'Unknown error',
      )

      logJobExecution('monthly-rent-payment', 'failed', result)
      return result
    }
  },
}
