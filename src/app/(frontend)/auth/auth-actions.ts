'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
import { cookies } from 'next/headers'
import { z } from 'zod'

const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[0-9]{10,15}$/.test(val), 'Invalid phone number format'),
})

/**
 * Safely extract a message and optional status/code from an unknown error.
 * Avoids using `any` in catch clauses to satisfy @typescript-eslint/no-explicit-any.
 */
function extractErrorInfo(err: unknown): { message: string; status?: number | string } {
  if (err instanceof Error) return { message: err.message }
  if (typeof err === 'object' && err !== null) {
    const maybe = err as Record<string, unknown>
    const status = maybe.status ?? maybe.code
    const message = typeof maybe.message === 'string' ? maybe.message : String(maybe)
    return {
      message,
      status: typeof status === 'number' || typeof status === 'string' ? status : undefined,
    }
  }
  return { message: String(err) }
}

export async function signUpAction(formData: FormData) {
  const payload = await getPayload({ config })
  const data = Object.fromEntries(formData.entries())
  const parsed = signUpSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors }
  }
  try {
    await payload.create({
      collection: 'customers',
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        phone: parsed.data.phone || undefined,
      },
    })
    return { success: true }
  } catch (err: unknown) {
    const { message } = extractErrorInfo(err)
    if (/duplicate key/i.test(message) || /E11000/.test(message)) {
      return { error: 'An account with that email already exists.' }
    }
    return { error: message || 'Unknown error' }
  }
}

export async function signInAction({ email, password }: { email: string; password: string }) {
  try {
    const payload = await getPayload({ config })
    // Perform login via Payload local API (no express req/res, so cookie not auto-set)
    const { token, user, exp } = await payload.login({
      collection: 'customers',
      data: { email, password },
    })

    // Manually set auth cookie so subsequent /api/customers/me calls succeed
    // Mimic Payload's default cookie naming convention
    const cookieName = `${payload.config.cookiePrefix || 'payload'}-token`
    const secure = process.env.NODE_ENV === 'production'
    const expires = exp ? new Date(exp * 1000) : undefined
    const cookieStore = await cookies()
    if (typeof token === 'string' && token.length) {
      cookieStore.set(cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure,
        path: '/',
        ...(expires ? { expires } : {}),
      })
    }

    return { success: true, user }
  } catch (error: unknown) {
    const { message } = extractErrorInfo(error)
    console.log('signin error : ', { error })
    throw new Error(message || 'Sign in failed')
  }
}

export async function resetPasswordAction(formData: FormData) {
  const token = formData.get('token')
  const password = formData.get('password')
  if (!token || typeof token !== 'string') {
    return { error: 'Reset token is required' }
  }
  if (!password || typeof password !== 'string') {
    return { error: 'Password is required' }
  }
  try {
    const payload = await getPayload({ config })
    await payload.resetPassword({
      collection: 'customers',
      data: { token, password },
      overrideAccess: false,
    })
    return { success: true }
  } catch (error: unknown) {
    const { message } = extractErrorInfo(error)
    return { error: message || 'Failed to reset password' }
  }
}

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
  } catch (err: unknown) {
    const { message, status } = extractErrorInfo(err)

    // 403 commonly means: invalid API key, unverified domain/from address, or plan restriction.
    if (status === 403 || /403/.test(message || '')) {
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
