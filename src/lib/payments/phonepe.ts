// PhonePe integration using official Node.js SDK
// Follows PhonePe documentation: https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/

import { StandardCheckoutClient, Env, StandardCheckoutPayRequest } from 'pg-sdk-node'

export type PhonePeInitArgs = {
  amountPaise: number
  merchantOrderId: string
  redirectUrl: string
  // callbackUrl is not used by PhonePe SDK - callbacks are configured on PhonePe side
}

export type PhonePeCreateResult = {
  success: boolean
  redirectUrl?: string
  instrument?: any
  raw: any
}

export type PhonePeStatusResult = {
  success: boolean
  code?: string
  state?: 'PAYMENT_SUCCESS' | 'PAYMENT_PENDING' | 'PAYMENT_ERROR' | string
  raw: any
}

export function getPhonePeConfig() {
  console.log('[PhonePe Config] Loading environment variables...')

  const clientId = process.env.PHONEPE_CLIENT_ID || ''
  const clientSecret = process.env.PHONEPE_CLIENT_SECRET || ''
  const clientVersion = process.env.PHONEPE_CLIENT_VERSION || '1'
  const env = process.env.PHONEPE_ENV || 'UAT'

  console.log('[PhonePe Config] Environment variables:', {
    hasClientId: !!clientId,
    hasClientSecret: !!clientSecret,
    clientVersion,
    env,
  })

  if (!clientId || !clientSecret) {
    console.error('[PhonePe Config] Missing required environment variables')
    throw new Error('PhonePe env not configured (PHONEPE_CLIENT_ID, PHONEPE_CLIENT_SECRET)')
  }

  console.log('[PhonePe Config] Configuration loaded successfully')
  return { clientId, clientSecret, clientVersion, env }
}

// Initialize PhonePe client as singleton with lazy initialization
let client: StandardCheckoutClient | null = null

export function getPhonePeClient(): StandardCheckoutClient {
  console.log('[PhonePe Client] Getting client instance...')

  // Check if client is already initialized
  if (client) {
    console.log('[PhonePe Client] Returning existing singleton client instance')
    return client
  }

  // Initialize client if not already done
  console.log('[PhonePe Client] Initializing new client instance...')

  try {
    const config = getPhonePeConfig()

    client = StandardCheckoutClient.getInstance(
      config.clientId,
      config.clientSecret,
      Number(config.clientVersion),
      config.env === 'PRODUCTION' ? Env.PRODUCTION : Env.SANDBOX,
    )

    console.log('[PhonePe Client] Client initialized successfully')
    return client
  } catch (error) {
    console.error('[PhonePe Client] Failed to initialize client:', error)
    throw new Error(
      `PhonePe client initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
    )
  }
}

export async function phonePeCreatePayment(args: PhonePeInitArgs): Promise<PhonePeCreateResult> {
  console.log('[PhonePe Library] Starting payment creation with official SDK...')

  try {
    const client = getPhonePeClient()

    // Create payment request using builder pattern (following the working example)
    const request = StandardCheckoutPayRequest.builder()
      .merchantOrderId(args.merchantOrderId)
      .amount(args.amountPaise) // Amount in paisa
      .redirectUrl(args.redirectUrl)
      .build()

    console.log('[PhonePe Library] Payment request created:', {
      merchantOrderId: args.merchantOrderId,
      amount: args.amountPaise,
      redirectUrl: args.redirectUrl,
    })

    // Use the SDK's pay method
    const response = await client.pay(request)
    console.log('[PhonePe Library] SDK response:', JSON.stringify(response, null, 2))

    // Extract redirect URL from response
    const redirectUrl = response.redirectUrl
    const instrument = response

    console.log('[PhonePe Library] Extracted redirect URL:', redirectUrl)

    return {
      success: !!redirectUrl,
      redirectUrl,
      instrument,
      raw: response,
    }
  } catch (error: any) {
    console.error('[PhonePe Library] Error in payment creation:', error)
    return {
      success: false,
      redirectUrl: undefined,
      instrument: undefined,
      raw: { error: error?.message || 'Unknown error' },
    }
  }
}

export async function phonePeCheckStatus(merchantOrderId: string): Promise<PhonePeStatusResult> {
  console.log('[PhonePe Library] Checking payment status for merchantOrderId:', merchantOrderId)

  try {
    const client = getPhonePeClient()

    // Use the SDK's getOrderStatus method
    const response = await client.getOrderStatus(merchantOrderId)
    console.log('[PhonePe Library] Status response:', JSON.stringify(response, null, 2))

    // Handle empty or null response
    if (!response || (typeof response === 'object' && Object.keys(response).length === 0)) {
      console.warn('[PhonePe Library] Empty response from PhonePe API')
      return {
        success: false,
        code: 'EMPTY_RESPONSE',
        state: 'PENDING',
        raw: response || '',
      }
    }

    // Extract status information from response
    const state = response.state
    const code = response.state // Use state as code for consistency

    console.log('[PhonePe Library] Extracted status:', { state, code })

    return {
      success: state === 'COMPLETED',
      code,
      state,
      raw: response,
    }
  } catch (error: any) {
    console.error('[PhonePe Library] Error checking status:', error)
    return {
      success: false,
      code: 'ERROR',
      state: 'PAYMENT_ERROR',
      raw: { error: error?.message || 'Unknown error' },
    }
  }
}

// For callbacks: PhonePe sends webhook notifications
export function verifyCallbackSignature({
  body,
  headerXVerify,
}: {
  body: unknown
  headerXVerify?: string | null
}) {
  console.log('[PhonePe Library] Verifying callback signature...')

  try {
    const client = getPhonePeClient()

    // Use the SDK's validateCallback method with correct parameters
    const isValid = client.validateCallback(
      JSON.stringify(body),
      headerXVerify || '',
      process.env.PHONEPE_CLIENT_ID || '',
      process.env.PHONEPE_CLIENT_SECRET || '',
    )

    console.log('[PhonePe Library] Callback validation result:', isValid)
    return isValid
  } catch (error) {
    console.error('[PhonePe Library] Error validating callback:', error)
    return false
  }
}

// Helper function for backward compatibility
export function verifyCallbackSignatureRaw({
  rawJsonText,
  headerXVerify,
}: {
  rawJsonText: string
  headerXVerify?: string | null
}) {
  try {
    const body = JSON.parse(rawJsonText)
    return verifyCallbackSignature({ body, headerXVerify })
  } catch {
    return false
  }
}

// Utility functions for base64 encoding/decoding (if needed)
export function toBase64(obj: unknown) {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

export function fromBase64<T = any>(b64: string): T {
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf-8')) as T
}
