'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

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
  } catch (error: any) {
    return { error: error.message || 'Failed to reset password' }
  }
}
