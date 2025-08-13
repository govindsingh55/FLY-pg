import { getPayload } from 'payload'
import config from '@payload-config'

export type AuthCollection = 'customers' | 'users'

export interface LoginResult {
  success: boolean
  user?: any
  collection?: AuthCollection
  error?: string
}

// Centralized login using Payload local API
export async function loginUser({
  collection,
  email,
  password,
}: {
  collection: AuthCollection
  email: string
  password: string
}): Promise<LoginResult> {
  try {
    const payload = await getPayload({ config })
    const result = await payload.login({
      collection,
      data: { email, password },
    })
    // result.user contains user doc; strip sensitive fields
    const {
      password: _pw,
      resetPasswordToken,
      resetPasswordExpiration,
      ...safeUser
    } = (result as any)?.user || {}
    return { success: true, user: safeUser, collection }
  } catch (err: any) {
    return { success: false, error: err?.message || 'Login failed' }
  }
}
