'use server'

import { getPayload } from 'payload'
import config from '@payload-config'

interface ForgotPasswordResultBase {
  success?: boolean
  error?: string
}

interface ForgotPasswordSuccess extends ForgotPasswordResultBase {
  success: true
  fallback?: boolean
  resetLink?: string
  note?: string
}

interface ForgotPasswordError extends ForgotPasswordResultBase {
  error: string
  internal?: string
}

export type ForgotPasswordResult = ForgotPasswordSuccess | ForgotPasswordError

// Server action: triggers Payload's built-in forgotPassword for the 'customers' collection.
// Relies on Customers collection auth.forgotPassword.generateEmailHTML for email content.
export async function forgotPasswordAction(formData: FormData): Promise<ForgotPasswordResult> {
  const email = formData.get('email')
  if (!email || typeof email !== 'string') {
    return { error: 'Email is required' }
  }

  const payload = await getPayload({ config })

  if (!process.env.RESEND_API_KEY) {
    return { error: 'Email service not configured. Please try again later.' }
  }

  try {
    // This both generates a reset token and sends the email via the configured adapter.
    await payload.forgotPassword({
      collection: 'customers',
      data: { email },
    })
    return { success: true }
  } catch (err: any) {
    const status = err?.status || err?.code

    // 403 commonly means: invalid API key, unverified domain/from address, or plan restriction.
    if (status === 403 || /403/.test(err?.message || '')) {
      if (
        process.env.ALLOW_EMAIL_403_FALLBACK === 'true' &&
        process.env.NODE_ENV !== 'production'
      ) {
        // Fallback to a default email address for development/testing.
        return {
          success: true,
          fallback: true,
          resetLink: 'https://example.com/reset-password?token=example-token',
          note: 'Email service temporarily unavailable. Using fallback link.',
        }
      }
      return {
        error:
          'Password reset email could not be sent. Please try again shortly or contact support.',
        internal:
          'Email 403: verify RESEND_API_KEY, confirm domain or from address is verified in Resend dashboard, or temporarily set RESEND_FROM_ADDRESS=onboarding@resend.dev. Check Resend logs for details.',
      }
    }

    // User-not-found case: Payload intentionally does not reveal if user exists; still respond success-like.
    if (status === 404) {
      return { success: true }
    }

    return { error: 'Failed to send reset link. Please try again.' }
  }
}
