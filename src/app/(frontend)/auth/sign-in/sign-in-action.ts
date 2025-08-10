'use server'
import config from '@payload-config'
import { getPayload } from 'payload'

// This function handles sign-in logic. Adjust endpoint and error handling as needed.
export async function signInAction({ email, password }: { email: string; password: string }) {
  try {
    const payload = await getPayload({ config })
    await payload.login({
      collection: 'customers',
      data: {
        email,
        password,
      },
    })

    return { success: true }
  } catch (error: any) {
    console.log('signin error : ', { error })
    throw new Error(error.message || 'Sign in failed')
  }
}
