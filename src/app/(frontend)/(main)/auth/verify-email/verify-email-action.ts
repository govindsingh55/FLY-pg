'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

export async function verifyEmailAction(token: string) {
  if (!token) return { error: 'Missing token' }
  try {
    const payload = await getPayload({ config })
    const result = await payload.verifyEmail({ collection: 'customers', token })
    return { success: true, user: result }
  } catch (err: any) {
    return { error: err?.message || 'Verification failed' }
  }
}

// Placeholder: resend flow not implemented due to missing sendEmailVerification in current Payload version.
export async function resendVerificationPlaceholder() {
  return {
    error: 'Resend verification not available yet. Please wait a few minutes and check spam.',
  }
}
