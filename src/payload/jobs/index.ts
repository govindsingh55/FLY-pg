import { JobsConfig, TaskConfig, PayloadRequest } from 'payload'
import { Booking, Customer, Payment, Property } from '../payload-types'
import { isSameMonth, subMonths, parseISO, set } from 'date-fns'

// Constants
const PAYMENT_CONSTANTS = {
  DUE_DATE_DAY: 7,
  FIRST_DAY_OF_MONTH: 1,
  MAX_PAYMENT_RETRIES: 1,
  PAYMENT_QUERY_LIMIT: 2,
} as const

const EMAIL_TEMPLATES = {
  GENTLE_REMINDER: {
    subject: 'Payment Reminder - Gentle Notice',
    text: 'This is a gentle reminder for your rent payment. Please pay your rent for the current month.',
    html: '<p>This is a gentle reminder for your rent payment. Please pay your rent for the current month.</p>',
  },
  LATE_PAYMENT_WARNING: {
    subject: 'Payment Reminder - Late Payment Warning',
    text: 'Please pay your rent for the current month. If you do not pay your rent by the 7th of the month, you may have to pay late fees.',
    html: '<p>Please pay your rent for the current month. If you do not pay your rent by the 7th of the month, you may have to pay late fees.</p>',
  },
} as const

const PAYMENT_STATUS = {
  NOTIFIED: 'notified',
  COMPLETED: 'completed',
  PENDING: 'pending',
  FAILED: 'failed',
} as const

// Types
interface CustomerWithBookings extends Customer {
  bookings: Booking[]
}

interface PaymentReminderContext {
  customer: CustomerWithBookings
  booking: Booking
  lastPayment: Payment | null
  currentDate: Date
}

interface EmailConfig {
  to: string
  subject: string
  text: string
  html: string
  template?: string
}

// Utility functions
const getCurrentDate = (): Date => new Date()

const getDueDate = (date: Date = getCurrentDate()): Date => {
  return set(date, {
    date: PAYMENT_CONSTANTS.DUE_DATE_DAY,
    hours: 0,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  })
}

const isFirstDayOfMonth = (date: Date = getCurrentDate()): boolean => {
  return date.getDate() === PAYMENT_CONSTANTS.FIRST_DAY_OF_MONTH
}

const isAfterDueDate = (date: Date = getCurrentDate()): boolean => {
  return date.getDate() > PAYMENT_CONSTANTS.DUE_DATE_DAY
}

const isBeforeDueDate = (date: Date = getCurrentDate()): boolean => {
  return date.getDate() < PAYMENT_CONSTANTS.DUE_DATE_DAY
}

const isPaymentCompletedForLastMonth = (payment: Payment | null): boolean => {
  if (!payment || payment.status !== PAYMENT_STATUS.COMPLETED) {
    return false
  }

  const lastPaymentDate = parseISO(payment.paymentForDate)
  const now = getCurrentDate()
  const lastMonth = subMonths(now, 1)

  return isSameMonth(lastPaymentDate, lastMonth)
}

const shouldCreateNewPayment = (context: PaymentReminderContext): boolean => {
  const { lastPayment, currentDate } = context

  return isFirstDayOfMonth(currentDate) || isPaymentCompletedForLastMonth(lastPayment)
}

const shouldSendLatePaymentWarning = (context: PaymentReminderContext): boolean => {
  const { lastPayment, currentDate } = context

  return isAfterDueDate(currentDate) && lastPayment?.status === PAYMENT_STATUS.NOTIFIED
}

const shouldSendGentleReminder = (context: PaymentReminderContext): boolean => {
  const { lastPayment, currentDate } = context

  return isBeforeDueDate(currentDate) && lastPayment?.status === PAYMENT_STATUS.NOTIFIED
}

// Database operations
const fetchActiveCustomers = async (payload: PayloadRequest['payload']) => {
  try {
    console.log('🔍 [TASK] Fetching active customers...')
    const result = await payload.find({
      collection: 'customers',
      where: {
        status: {
          equals: 'active',
        },
      },
      populate: {
        bookings: {},
      },
      depth: 1,
    })

    console.log(`✅ [TASK] Found ${result.docs.length} active customers`)
    return result.docs as CustomerWithBookings[]
  } catch (error) {
    console.error('❌ [TASK] Error fetching active customers:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    })
    throw new Error('Failed to fetch active customers')
  }
}

const fetchCustomerPayments = async (
  payload: PayloadRequest['payload'],
  customerId: string,
): Promise<Payment[]> => {
  try {
    console.log(`🔍 [TASK] Fetching payments for customer ${customerId}...`)
    const result = await payload.find({
      collection: 'payments',
      where: {
        customer: { equals: customerId },
      },
      sort: '-createdAt',
      limit: PAYMENT_CONSTANTS.PAYMENT_QUERY_LIMIT,
    })

    console.log(`✅ [TASK] Found ${result.docs.length} payments for customer ${customerId}`)
    return result.docs as Payment[]
  } catch (error) {
    console.error(`❌ [TASK] Error fetching payments for customer ${customerId}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      customerId,
      timestamp: new Date().toISOString(),
    })
    throw new Error(`Failed to fetch payments for customer ${customerId}`)
  }
}

const fetchPropertyDetails = async (
  payload: PayloadRequest['payload'],
  propertyId: string,
): Promise<Property | null> => {
  try {
    console.log(`🔍 [TASK] Fetching property details for ${propertyId}...`)
    const result = await payload.find({
      collection: 'properties',
      where: {
        id: { equals: propertyId },
      },
      depth: 1,
    })

    const property = (result.docs[0] as Property) || null
    console.log(`✅ [TASK] Property ${propertyId} ${property ? 'found' : 'not found'}`)
    return property
  } catch (error) {
    console.error(`❌ [TASK] Error fetching property ${propertyId}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      propertyId,
      timestamp: new Date().toISOString(),
    })
    return null
  }
}

const createPaymentRecord = async (
  payload: PayloadRequest['payload'],
  context: PaymentReminderContext,
  foodAmount: number,
): Promise<void> => {
  const { customer, booking, lastPayment } = context

  try {
    const paymentData = {
      customer: customer.id,
      paymentForDate: getCurrentDate().toISOString(),
      amount: booking.price + foodAmount,
      payfor: booking.id,
      dueDate: getDueDate().toISOString(),
      lastUpdatedAt: getCurrentDate().toISOString(),
      status: PAYMENT_STATUS.NOTIFIED,
      bookingSnapshot: lastPayment?.bookingSnapshot || null,
    }

    console.log(`💰 [TASK] Creating payment record for customer ${customer.id}:`, {
      amount: paymentData.amount,
      bookingId: booking.id,
      dueDate: paymentData.dueDate,
      foodAmount,
    })

    await payload.create({
      collection: 'payments',
      data: paymentData,
    })

    console.log(`✅ [TASK] Payment record created successfully for customer ${customer.id}`)
  } catch (error) {
    console.error(`❌ [TASK] Error creating payment for customer ${customer.id}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      customerId: customer.id,
      bookingId: booking.id,
      timestamp: new Date().toISOString(),
    })
    throw new Error(`Failed to create payment for customer ${customer.id}`)
  }
}

// Email operations
const sendEmail = async (
  payload: PayloadRequest['payload'],
  config: EmailConfig,
): Promise<void> => {
  try {
    console.log(`📧 [TASK] Sending email to ${config.to}:`, {
      subject: config.subject,
      template: config.template || 'none',
    })

    await payload.sendEmail({
      to: config.to,
      subject: config.subject,
      text: config.text,
      html: config.html,
      from: process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev',
      ...(config.template && { template: config.template }),
    })

    console.log(`✅ [TASK] Email sent successfully to ${config.to}`)
  } catch (error) {
    console.error(`❌ [TASK] Error sending email to ${config.to}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      recipient: config.to,
      subject: config.subject,
      timestamp: new Date().toISOString(),
    })
    throw new Error(`Failed to send email to ${config.to}`)
  }
}

const sendPaymentReminderEmail = async (
  payload: PayloadRequest['payload'],
  customer: Customer,
  template: keyof typeof EMAIL_TEMPLATES,
): Promise<void> => {
  console.log(
    `📧 [TASK] Preparing ${template} email for customer ${customer.id} (${customer.email})`,
  )

  const emailConfig: EmailConfig = {
    to: customer.email,
    ...EMAIL_TEMPLATES[template],
  }

  await sendEmail(payload, emailConfig)
}

// Main business logic
const processCustomerBooking = async (
  payload: PayloadRequest['payload'],
  customer: CustomerWithBookings,
  booking: Booking,
): Promise<void> => {
  try {
    console.log(
      `🔄 [TASK] Processing booking ${booking.id} for customer ${customer.id} (${customer.email})`,
    )

    const payments = await fetchCustomerPayments(payload, customer.id)
    const lastPayment = payments[0] || null

    const context: PaymentReminderContext = {
      customer,
      booking,
      lastPayment,
      currentDate: getCurrentDate(),
    }

    console.log(`📊 [TASK] Payment context for customer ${customer.id}:`, {
      hasLastPayment: !!lastPayment,
      lastPaymentStatus: lastPayment?.status || 'none',
      lastPaymentDate: lastPayment?.paymentForDate || 'none',
      currentDate: getCurrentDate().toISOString(),
      bookingPrice: booking.price,
      foodIncluded: booking.foodIncluded,
    })

    // Calculate food amount if needed
    let foodAmount = 0
    if (booking.foodIncluded && booking.property) {
      const property = await fetchPropertyDetails(payload, booking.property as string)
      foodAmount = property?.foodMenu?.price ?? 0
      console.log(`🍽️ [TASK] Food amount calculated for customer ${customer.id}: ${foodAmount}`)
    }

    // Create new payment if conditions are met
    if (shouldCreateNewPayment(context)) {
      console.log(`💰 [TASK] Creating new payment for customer ${customer.id}`)
      await createPaymentRecord(payload, context, foodAmount)
      await sendPaymentReminderEmail(payload, customer, 'GENTLE_REMINDER')
    }

    // Send late payment warning
    if (shouldSendLatePaymentWarning(context)) {
      console.log(`⚠️ [TASK] Sending late payment warning to customer ${customer.id}`)
      await sendPaymentReminderEmail(payload, customer, 'LATE_PAYMENT_WARNING')
    }

    // Send gentle reminder
    if (shouldSendGentleReminder(context)) {
      console.log(`💌 [TASK] Sending gentle reminder to customer ${customer.id}`)
      await sendPaymentReminderEmail(payload, customer, 'GENTLE_REMINDER')
    }

    console.log(`✅ [TASK] Completed processing booking ${booking.id} for customer ${customer.id}`)
  } catch (error) {
    console.error(`❌ [TASK] Error processing booking ${booking.id} for customer ${customer.id}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      customerId: customer.id,
      bookingId: booking.id,
      timestamp: new Date().toISOString(),
    })
    // Continue processing other bookings even if one fails
  }
}

const processCustomer = async (
  payload: PayloadRequest['payload'],
  customer: CustomerWithBookings,
): Promise<void> => {
  const bookings = customer.bookings || []

  console.log(
    `👤 [TASK] Processing customer ${customer.id} (${customer.email}) with ${bookings.length} bookings`,
  )

  // Process all bookings for this customer
  const results = await Promise.allSettled(
    bookings.map((booking) => processCustomerBooking(payload, customer, booking)),
  )

  const successful = results.filter((result) => result.status === 'fulfilled').length
  const failed = results.filter((result) => result.status === 'rejected').length

  console.log(`📈 [TASK] Customer ${customer.id} processing summary:`, {
    totalBookings: bookings.length,
    successful,
    failed,
    successRate: `${Math.round((successful / bookings.length) * 100)}%`,
  })
}

const CustomerRentReminderNotificationTask = {
  retries: PAYMENT_CONSTANTS.MAX_PAYMENT_RETRIES,
  slug: 'customer-rent-reminder-notification-task',
  handler: async ({ req }: { req: PayloadRequest }) => {
    const { payload } = req
    const jobId = Math.random().toString(36).substring(7)
    const startTime = Date.now()

    try {
      console.log(`🚀 [TASK-${jobId}] Starting customer rent reminder notification job...`)
      console.log(`📋 [TASK-${jobId}] Job configuration:`, {
        retries: PAYMENT_CONSTANTS.MAX_PAYMENT_RETRIES,
        dueDateDay: PAYMENT_CONSTANTS.DUE_DATE_DAY,
        firstDayOfMonth: PAYMENT_CONSTANTS.FIRST_DAY_OF_MONTH,
        timestamp: new Date().toISOString(),
      })

      const customers = await fetchActiveCustomers(payload)
      console.log(`👥 [TASK-${jobId}] Found ${customers.length} active customers to process`)

      if (customers.length === 0) {
        console.log(`ℹ️ [TASK-${jobId}] No active customers found, job completed`)
        return {
          output: {
            success: true,
            message: 'No active customers found',
            processedCustomers: 0,
            duration: `${Date.now() - startTime}ms`,
          },
        }
      }

      // Process all customers in parallel with error isolation
      console.log(`🔄 [TASK-${jobId}] Processing ${customers.length} customers in parallel...`)
      const results = await Promise.allSettled(
        customers.map((customer) => processCustomer(payload, customer)),
      )

      const successful = results.filter((result) => result.status === 'fulfilled').length
      const failed = results.filter((result) => result.status === 'rejected').length
      const duration = Date.now() - startTime

      console.log(`📊 [TASK-${jobId}] Job execution summary:`, {
        totalCustomers: customers.length,
        successful,
        failed,
        successRate: `${Math.round((successful / customers.length) * 100)}%`,
        duration: `${duration}ms`,
        averageTimePerCustomer: `${Math.round(duration / customers.length)}ms`,
      })

      if (failed > 0) {
        console.warn(`⚠️ [TASK-${jobId}] Some customers failed to process:`, {
          failedCustomers: results
            .map((result, index) => ({ index, result }))
            .filter(({ result }) => result.status === 'rejected')
            .map(({ index, result }) => ({
              customerId: customers[index].id,
              error: result.status === 'rejected' ? result.reason : 'Unknown error',
            })),
        })
      }

      console.log(
        `✅ [TASK-${jobId}] Customer rent reminder notification job completed successfully`,
      )

      return {
        output: {
          success: true,
          message: 'Customer rent reminder notification scheduled successfully',
          processedCustomers: customers.length,
          successfulCustomers: successful,
          failedCustomers: failed,
          duration: `${duration}ms`,
        },
      }
    } catch (error) {
      const duration = Date.now() - startTime
      console.error(`❌ [TASK-${jobId}] Error in customer rent reminder notification job:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        duration: `${duration}ms`,
        timestamp: new Date().toISOString(),
      })

      return {
        output: {
          success: false,
          message: 'Customer rent reminder notification job failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          duration: `${duration}ms`,
        },
      }
    }
  },
} as unknown as TaskConfig

export { CustomerRentReminderNotificationTask }

// Export individual functions for direct use
export {
  fetchActiveCustomers,
  processCustomer,
  processCustomerBooking,
  sendPaymentReminderEmail,
  createPaymentRecord,
  fetchCustomerPayments,
  fetchPropertyDetails,
}

export default {
  jobsCollectionOverrides: ({ defaultJobsCollection }) => {
    return defaultJobsCollection
  },
  tasks: [CustomerRentReminderNotificationTask],
} as JobsConfig
