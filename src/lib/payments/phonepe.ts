// PhonePe integration helpers (prod-ready structure, still safe to run in dev).
// Implements request signing, create transaction, status check, and callback signature verify.

import crypto from 'crypto'

export type PhonePeInitArgs = {
  amountPaise: number
  merchantTransactionId: string
  merchantUserId: string
  redirectUrl: string
  callbackUrl: string
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

export function toBase64(obj: unknown) {
  return Buffer.from(JSON.stringify(obj)).toString('base64')
}

export function fromBase64<T = any>(b64: string): T {
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf-8')) as T
}

function sha256Hex(input: string) {
  const hash = crypto.createHash('sha256')
  hash.update(input)
  return hash.digest('hex')
}

export function buildChecksumBase64Payload(
  payloadBase64: string,
  saltKey: string,
  endpointPath: string,
) {
  return sha256Hex(payloadBase64 + endpointPath + saltKey)
}

export function buildChecksumForPathOnly(endpointPath: string, saltKey: string) {
  return sha256Hex(endpointPath + saltKey)
}

export function getPhonePeConfig() {
  const merchantId = process.env.PHONEPE_MERCHANT_ID || ''
  const saltKey = process.env.PHONEPE_SALT_KEY || ''
  const keyIndex = process.env.PHONEPE_KEY_INDEX || '1'
  const baseUrl = process.env.PHONEPE_BASE_URL || 'https://api-uat.phonepe.com/apis/hermes'
  if (!merchantId || !saltKey) {
    throw new Error('PhonePe env not configured (PHONEPE_MERCHANT_ID, PHONEPE_SALT_KEY)')
  }
  return { merchantId, saltKey, keyIndex, baseUrl }
}

export async function phonePeCreatePayment(args: PhonePeInitArgs): Promise<PhonePeCreateResult> {
  const { merchantId, saltKey, keyIndex, baseUrl } = getPhonePeConfig()
  const endpointPath = '/pg/v1/pay'

  const requestPayload: any = {
    merchantId,
    merchantTransactionId: args.merchantTransactionId,
    merchantUserId: args.merchantUserId,
    amount: args.amountPaise, // in paise
    redirectUrl: args.redirectUrl,
    redirectMode: 'REDIRECT',
    callbackUrl: args.callbackUrl,
    paymentInstrument: { type: 'PAY_PAGE' },
  }

  const base64 = toBase64(requestPayload)
  const checksum = buildChecksumBase64Payload(base64, saltKey, endpointPath)
  const verifyHeader = `${checksum}###${keyIndex}`

  const res = await fetch(`${baseUrl}${endpointPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': verifyHeader,
      'X-MERCHANT-ID': merchantId,
    },
    body: JSON.stringify({ request: base64 }),
    // Keep default cache; PhonePe endpoints are external
  })

  const raw = await res.json().catch(() => ({}))

  // Expected successful shape: { success: true, data: { instrumentResponse: { redirectInfo: { url }}}}
  const redirectUrl = raw?.data?.instrumentResponse?.redirectInfo?.url
  const instrument = raw?.data?.instrumentResponse
  return { success: !!raw?.success, redirectUrl, instrument, raw }
}

export async function phonePeCheckStatus(
  merchantTransactionId: string,
): Promise<PhonePeStatusResult> {
  const { merchantId, saltKey, keyIndex, baseUrl } = getPhonePeConfig()
  const endpointPath = `/pg/v1/status/${merchantId}/${merchantTransactionId}`
  const checksum = buildChecksumForPathOnly(endpointPath, saltKey)
  const verifyHeader = `${checksum}###${keyIndex}`

  const res = await fetch(`${baseUrl}${endpointPath}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'X-VERIFY': verifyHeader,
      'X-MERCHANT-ID': merchantId,
    },
  })

  const raw = await res.json().catch(() => ({}))
  const code = raw?.code || raw?.data?.state
  const state = raw?.data?.state || raw?.code
  return { success: !!raw?.success, code, state, raw }
}

// For callbacks: PhonePe may send x-verify header computed from base64Body + path + saltKey.
// We verify using the same convention we use for requests.
// Preferred verification using the raw JSON text as received (no parse/stringify differences)
export function verifyCallbackSignatureRaw({
  rawJsonText,
  headerXVerify,
  endpointPath,
}: {
  rawJsonText: string
  headerXVerify?: string | null
  endpointPath: string
}) {
  try {
    const { saltKey, keyIndex } = getPhonePeConfig()
    if (!headerXVerify) return false
    const base64 = Buffer.from(rawJsonText).toString('base64')
    const expected = buildChecksumBase64Payload(base64, saltKey, endpointPath) + `###${keyIndex}`
    return headerXVerify === expected
  } catch {
    return false
  }
}

// Backward helper when only an already-parsed object is available
export function verifyCallbackSignature(args: {
  body: unknown
  headerXVerify?: string | null
  endpointPath: string
}) {
  const base64 = toBase64(args.body)
  const { saltKey, keyIndex } = getPhonePeConfig()
  const checksum = buildChecksumBase64Payload(base64, saltKey, args.endpointPath)
  const expected = `${checksum}###${keyIndex}`
  return !!args.headerXVerify && args.headerXVerify === expected
}
