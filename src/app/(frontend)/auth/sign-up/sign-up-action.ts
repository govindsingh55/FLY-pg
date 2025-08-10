'use server'

import config from '@payload-config'
import { getPayload } from 'payload'
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
  } catch (err) {
    if (err instanceof Error) {
      if (/duplicate key/i.test(err.message) || /E11000/.test(err.message)) {
        return { error: 'An account with that email already exists.' }
      }
      return { error: err.message }
    }
    return { error: 'Unknown error' }
  }
}
