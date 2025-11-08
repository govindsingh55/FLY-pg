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
  NOTIFIED: 'notified', // Status when payment reminder is sent
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

  if (!payment.paymentDate) {
    return false
  }

  const lastPaymentDate = parseISO(payment.paymentDate)
  const now = getCurrentDate()
  const lastMonth = subMonths(now, 1)

  return isSameMonth(lastPaymentDate, lastMonth)
}

const hasExistingRentInvoiceForCurrentMonth = async (
  payload: PayloadRequest['payload'],
  bookingId: string,
): Promise<boolean> => {
  try {
    const currentDate = getCurrentDate()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()

    console.log(
      `🔍 [TASK] Checking for existing rent invoice for booking ${bookingId} in ${currentMonth + 1}/${currentYear}`,
    )

    const result = await payload.find({
      collection: 'payments',
      where: {
        and: [{ payfor: { equals: bookingId } }, { paymentType: { equals: 'rent' } }],
      },
      limit: 10,
    })

    // Check if any payment is for the current month and year
    const hasInvoice = result.docs.some((payment) => {
      if (!payment.paymentForMonthAndYear) return false

      const paymentDate = parseISO(payment.paymentForMonthAndYear)
      return paymentDate.getFullYear() === currentYear && paymentDate.getMonth() === currentMonth
    })

    console.log(
      `✅ [TASK] Booking ${bookingId} ${hasInvoice ? 'already has' : 'does not have'} rent invoice for current month`,
    )

    return hasInvoice
  } catch (error) {
    console.error(`❌ [TASK] Error checking existing rent invoice for booking ${bookingId}:`, error)
    // Return true to prevent duplicate creation in case of error
    return true
  }
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
      depth: 2, // Increased depth to fetch nested settings
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
  bookingId?: string,
): Promise<Payment[]> => {
  try {
    console.log(
      `🔍 [TASK] Fetching rent payments for customer ${customerId}${bookingId ? ` and booking ${bookingId}` : ''}...`,
    )

    const result = await payload.find({
      collection: 'payments',
      where: {
        and: [
          { customer: { equals: customerId } },
          { paymentType: { equals: 'rent' } },
          ...(bookingId ? [{ payfor: { equals: bookingId } }] : []),
        ],
      },
      sort: '-createdAt',
      limit: PAYMENT_CONSTANTS.PAYMENT_QUERY_LIMIT,
    })

    console.log(
      `✅ [TASK] Found ${result.docs.length} rent payments for customer ${customerId}${bookingId ? ` and booking ${bookingId}` : ''}`,
    )
    return result.docs as Payment[]
  } catch (error) {
    console.error(`❌ [TASK] Error fetching payments for customer ${customerId}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      customerId,
      bookingId,
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
): Promise<string> => {
  const { customer, booking } = context

  try {
    // Calculate monthly rent amount (room rent + food if included)
    const monthlyRoomRent = Number(booking.roomRent) || 0

    // Use booking.foodPrice if available, otherwise use fetched foodAmount from property
    // This prevents double-charging food
    const monthlyFoodPrice = booking.foodIncluded ? Number(booking.foodPrice) || foodAmount : 0

    const monthlyRent = monthlyRoomRent + monthlyFoodPrice

    // Create booking snapshot
    const bookingSnapshot = {
      bookingId: booking.id,
      propertyName: typeof booking.property === 'object' ? booking.property.name : 'Unknown',
      roomName: typeof booking.room === 'object' ? booking.room.name : 'Unknown',
      roomRent: booking.roomRent,
      foodPrice: booking.foodPrice,
      total: booking.total,
      periodInMonths: booking.periodInMonths,
      bookingCharge: booking.bookingCharge,
      securityDeposit: booking.securityDeposit,
      takeFirstMonthRentOnBooking: booking.takeFirstMonthRentOnBooking,
      foodIncluded: booking.foodIncluded,
      foodAmount: monthlyFoodPrice,
      startDate: booking.startDate,
      endDate: booking.endDate,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      status: booking.status,
      snapshotDate: getCurrentDate().toISOString(),
    }

    const paymentData = {
      customer: customer.id,
      paymentType: 'rent' as const, // This is a rent payment, electricity is billed separately
      // paymentDate is omitted - will be set when payment completes
      paymentForMonthAndYear: getCurrentDate().toISOString(),
      rent: monthlyRoomRent,
      amount: monthlyRent, // Rent + food (not double counted), electricity excluded
      payfor: booking.id,
      dueDate: getDueDate().toISOString(),
      lastUpdatedAt: getCurrentDate().toISOString(),
      status: PAYMENT_STATUS.NOTIFIED,
      bookingSnapshot: bookingSnapshot,
    }

    console.log(`💰 [TASK] Creating rent payment record for customer ${customer.id}:`, {
      paymentType: 'rent',
      amount: paymentData.amount,
      rent: monthlyRoomRent,
      foodAmount: monthlyFoodPrice,
      bookingId: booking.id,
      dueDate: paymentData.dueDate,
      note: 'Electricity will be billed separately',
    })

    const createdPayment = await payload.create({
      collection: 'payments',
      data: paymentData,
      draft: false,
    })

    console.log(`✅ [TASK] Payment record created successfully for customer ${customer.id}`)

    return createdPayment.id
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

// Notification operations
const createNotification = async (
  payload: PayloadRequest['payload'],
  customer: Customer,
  template: keyof typeof EMAIL_TEMPLATES,
  paymentId?: string,
): Promise<void> => {
  try {
    console.log(`🔔 [TASK] Creating notification for customer ${customer.id}`)

    await payload.create({
      collection: 'notifications',
      data: {
        customer: customer.id,
        title: EMAIL_TEMPLATES[template].subject,
        message: EMAIL_TEMPLATES[template].text,
        type: 'payment',
        category: 'payment',
        priority: template === 'LATE_PAYMENT_WARNING' ? 'high' : 'medium',
        isRead: false,
        ...(paymentId && { relatedPayment: paymentId }),
      },
    })

    console.log(`✅ [TASK] Notification created successfully for customer ${customer.id}`)
  } catch (error) {
    console.error(`❌ [TASK] Error creating notification for customer ${customer.id}:`, {
      error: error instanceof Error ? error.message : 'Unknown error',
      customerId: customer.id,
      timestamp: new Date().toISOString(),
    })
    // Don't throw - notification failure shouldn't stop email
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
      from: `${process.env.RESEND_FROM_NAME || 'FLY PG'} <${process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev'}>`,
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
  paymentId?: string,
): Promise<void> => {
  console.log(
    `📧 [TASK] Preparing ${template} email for customer ${customer.id} (${customer.email})`,
  )

  // Check notification preferences
  const customerWithSettings = customer as Customer & {
    settings?: {
      notifications?: { paymentReminders?: boolean }
      preferences?: { emailNotifications?: boolean }
    }
  }
  if (
    customerWithSettings?.settings?.notifications?.paymentReminders === false ||
    customerWithSettings?.settings?.preferences?.emailNotifications === false
  ) {
    console.log(
      `⏭️ [TASK] Skipping customer ${customer.id} - payment reminders disabled in preferences`,
    )
    return
  }

  const emailConfig: EmailConfig = {
    to: customer.email,
    ...EMAIL_TEMPLATES[template],
  }

  // Send email
  await sendEmail(payload, emailConfig)

  // Create notification record
  await createNotification(payload, customer, template, paymentId)
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

    // Skip inactive bookings
    if (booking.status === 'cancelled' || booking.status === 'completed') {
      console.log(`⏭️ [TASK] Skipping booking ${booking.id} - status is ${booking.status}`)
      return
    }

    // Check if booking is within active period
    const currentDate = getCurrentDate()
    if (booking.startDate) {
      const startDate = parseISO(booking.startDate)
      if (currentDate < startDate) {
        console.log(
          `⏭️ [TASK] Skipping booking ${booking.id} - not started yet (starts ${booking.startDate})`,
        )
        return
      }
    }

    if (booking.endDate) {
      const endDate = parseISO(booking.endDate)
      if (currentDate > endDate) {
        console.log(
          `⏭️ [TASK] Skipping booking ${booking.id} - already ended (ended ${booking.endDate})`,
        )
        return
      }
    }

    const payments = await fetchCustomerPayments(payload, customer.id, booking.id)
    const lastPayment = payments[0] || null

    const context: PaymentReminderContext = {
      customer,
      booking,
      lastPayment,
      currentDate: currentDate,
    }

    console.log(`📊 [TASK] Payment context for customer ${customer.id}:`, {
      hasLastPayment: !!lastPayment,
      lastPaymentStatus: lastPayment?.status || 'none',
      lastPaymentDate: lastPayment?.paymentDate || 'none',
      currentDate: getCurrentDate().toISOString(),
      bookingRoomRent: booking.roomRent,
      bookingFoodPrice: booking.foodPrice,
      foodIncluded: booking.foodIncluded,
    })

    // Calculate food amount if needed
    let foodAmount = 0
    if (booking.foodIncluded && booking.property) {
      const property = await fetchPropertyDetails(payload, booking.property as string)
      foodAmount = property?.foodMenu?.price ?? 0
      console.log(`🍽️ [TASK] Food amount calculated for customer ${customer.id}: ${foodAmount}`)
    }

    // Check if rent invoice already exists for current month
    const hasExistingInvoice = await hasExistingRentInvoiceForCurrentMonth(payload, booking.id)

    // Create new payment if conditions are met and no existing invoice
    if (!hasExistingInvoice && shouldCreateNewPayment(context)) {
      console.log(`💰 [TASK] Creating new payment for customer ${customer.id}`)
      const paymentId = await createPaymentRecord(payload, context, foodAmount)
      await sendPaymentReminderEmail(payload, customer, 'GENTLE_REMINDER', paymentId)
    } else if (hasExistingInvoice) {
      console.log(
        `ℹ️ [TASK] Rent invoice already exists for booking ${booking.id} for current month`,
      )
    }

    // Send late payment warning
    if (shouldSendLatePaymentWarning(context)) {
      console.log(`⚠️ [TASK] Sending late payment warning to customer ${customer.id}`)
      await sendPaymentReminderEmail(
        payload,
        customer,
        'LATE_PAYMENT_WARNING',
        lastPayment?.id as string,
      )
    }

    // Send gentle reminder
    if (shouldSendGentleReminder(context)) {
      console.log(`💌 [TASK] Sending gentle reminder to customer ${customer.id}`)
      await sendPaymentReminderEmail(
        payload,
        customer,
        'GENTLE_REMINDER',
        lastPayment?.id as string,
      )
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
  hasExistingRentInvoiceForCurrentMonth,
}

export default {
  jobsCollectionOverrides: ({ defaultJobsCollection }) => {
    return defaultJobsCollection
  },
  tasks: [CustomerRentReminderNotificationTask],
} as JobsConfig
