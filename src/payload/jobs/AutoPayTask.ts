import { TaskConfig, PayloadRequest } from 'payload'
import { Payment, Customer, PaymentMethod } from '../payload-types'
import { parseISO } from 'date-fns'

const fetchDuePendingPayments = async (payload: PayloadRequest['payload']) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Find payments that are pending or notified (not completed/failed)
  // AND are due on or before today
  const result = await payload.find({
    collection: 'payments',
    where: {
      and: [
        {
          status: {
            in: ['pending', 'notified'],
          },
        },
        {
          paymentType: {
            equals: 'rent',
          },
        },
      ],
    },
    limit: 100, // Process in batches
    depth: 2, // Need customer details
  })

  // Filter in memory for due date <= today (Payload query limits on date often tricky)
  return result.docs.filter((payment) => {
    if (!payment.dueDate) return false
    const dueDate = parseISO(payment.dueDate)
    return dueDate <= new Date()
  }) as Payment[]
}

const getCustomerAutoPaySettings = async (
  payload: PayloadRequest['payload'],
  customerId: string,
) => {
  const customer = await payload.findByID({
    collection: 'customers',
    id: customerId,
    depth: 0,
  })

  if (!customer.autoPayEnabled) return null

  // Fetch default payment method
  const paymentMethods = await payload.find({
    collection: 'payment-methods',
    where: {
      and: [{ customer: { equals: customerId } }, { isDefault: { equals: true } }],
    },
    limit: 1,
  })

  if (paymentMethods.docs.length === 0) return null

  return {
    settings: {
      maxAmount: customer.autoPayMaxAmount,
    },
    paymentMethod: paymentMethods.docs[0] as PaymentMethod,
  }
}

const processAutoPay = async (
  payload: PayloadRequest['payload'],
  payment: Payment,
): Promise<boolean> => {
  try {
    // Check if customer is populated
    if (!payment.customer || typeof payment.customer !== 'object') {
      console.log(`[AutoPay] Payment ${payment.id} has no populated customer.`)
      return false
    }

    const customer = payment.customer as Customer
    if (!customer.id) return false

    const autoPayData = await getCustomerAutoPaySettings(payload, customer.id)
    if (!autoPayData) {
      console.log(
        `[AutoPay] Customer ${customer.id} does not have Auto-Pay enabled or no default method.`,
      )
      return false
    }

    const { settings, paymentMethod } = autoPayData

    // Check max amount safety limit
    if (settings.maxAmount && payment.amount > settings.maxAmount) {
      console.log(
        `[AutoPay] Amount ${payment.amount} exceeds customer limit ${settings.maxAmount}. Skipping.`,
      )
      // Optional: Send notification about limit exceeded
      return false
    }

    console.log(
      `[AutoPay] Attempting charge for Payment ${payment.id} Amount: ${payment.amount} via ${paymentMethod.type}`,
    )

    // --- SIMULATE PG CALL ---
    // In real prod, call PhonePe S2S / Recurring API here using paymentMethod.token
    const success = true // Simulate success
    // ------------------------

    // Map PaymentMethod type to Payments collection allowed values
    let methodString = 'credit-card'
    if (paymentMethod.type === 'upi') methodString = 'upi'
    if (paymentMethod.type === 'netbanking') methodString = 'net-banking'
    // Default 'card' maps to 'credit-card' (could be debit, but for now safe default)

    if (success) {
      await payload.update({
        collection: 'payments',
        id: payment.id,
        data: {
          status: 'completed',
          paymentDate: new Date().toISOString(),
          merchantOrderId: `tx_auto_${Date.now()}`,
          gateway: 'auto-pay-simulation',
          paymentSource: 'auto-pay',
          paymentMethod: methodString as Payment['paymentMethod'],
          notes: `Auto-paid via ${paymentMethod.name} (${paymentMethod.maskedNumber})`,
        },
      })

      // TODO: Send success email

      return true
    }

    return false
  } catch (error) {
    console.error(`[AutoPay] Error processing payment ${payment.id}:`, error)
    return false
  }
}

export const AutoPayProcessTask: TaskConfig = {
  slug: 'auto-pay-process',
  handler: async ({ req }) => {
    const { payload } = req
    console.log('🚀 [AutoPay] Starting Auto-Pay Process...')

    const duePayments = await fetchDuePendingPayments(payload)
    console.log(`Found ${duePayments.length} potentially due payments.`)

    let processed = 0
    let success = 0

    for (const payment of duePayments) {
      const result = await processAutoPay(payload, payment)
      processed++
      if (result) success++
    }

    return {
      output: {
        message: `Processed ${processed} payments. ${success} successful.`,
      },
    }
  },
}
