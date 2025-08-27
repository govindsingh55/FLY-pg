import { NextRequest } from 'next/server'

export interface ProfileValidationError {
  field: string
  message: string
}

export interface ProfileData {
  name?: string
  email?: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  occupation?: string
  company?: string
  address?: {
    street?: string
    city?: string
    state?: string
    pincode?: string
    country?: string
  }
  emergencyContact?: {
    name?: string
    phone?: string
    relationship?: string
  }
  notificationPreferences?: {
    emailNotifications?: boolean
    smsNotifications?: boolean
    pushNotifications?: boolean
    bookingReminders?: boolean
    paymentReminders?: boolean
    maintenanceUpdates?: boolean
  }
}

export interface ProfileValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Validate customer profile data (for tests)
 */
export function validateProfile(data: ProfileData): ProfileValidationResult {
  const errors: string[] = []

  // Required fields validation
  if (!data.name || !data.name.trim()) {
    errors.push('name')
  }

  if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('email')
  }

  if (!data.phone || !/^[0-9]{10,15}$/.test(data.phone)) {
    errors.push('phone')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function validateProfileData(data: ProfileData): ProfileValidationError[] {
  const errors: ProfileValidationError[] = []

  // Name validation
  if (data.name !== undefined) {
    if (!data.name.trim()) {
      errors.push({ field: 'name', message: 'Name is required' })
    } else if (data.name.length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters long' })
    } else if (data.name.length > 50) {
      errors.push({ field: 'name', message: 'Name must be less than 50 characters' })
    }
  }

  // Phone validation
  if (data.phone !== undefined) {
    if (data.phone && !/^[6-9]\d{9}$/.test(data.phone)) {
      errors.push({ field: 'phone', message: 'Please enter a valid 10-digit Indian mobile number' })
    }
  }

  // Date of birth validation
  if (data.dateOfBirth !== undefined) {
    if (data.dateOfBirth) {
      const dob = new Date(data.dateOfBirth)
      const today = new Date()
      const age = today.getFullYear() - dob.getFullYear()

      if (age < 18) {
        errors.push({ field: 'dateOfBirth', message: 'Customer must be at least 18 years old' })
      }
      if (age > 100) {
        errors.push({ field: 'dateOfBirth', message: 'Please enter a valid date of birth' })
      }
    }
  }

  // Address validation
  if (data.address) {
    if (data.address.pincode && !/^[1-9][0-9]{5}$/.test(data.address.pincode)) {
      errors.push({
        field: 'address.pincode',
        message: 'Please enter a valid 6-digit Indian PIN code',
      })
    }

    if (data.address.city && data.address.city.length > 50) {
      errors.push({ field: 'address.city', message: 'City name must be less than 50 characters' })
    }

    if (data.address.state && data.address.state.length > 50) {
      errors.push({ field: 'address.state', message: 'State name must be less than 50 characters' })
    }
  }

  // Emergency contact validation
  if (data.emergencyContact) {
    if (data.emergencyContact.phone && !/^[6-9]\d{9}$/.test(data.emergencyContact.phone)) {
      errors.push({
        field: 'emergencyContact.phone',
        message: 'Please enter a valid 10-digit Indian mobile number',
      })
    }

    if (data.emergencyContact.name && data.emergencyContact.name.length > 50) {
      errors.push({
        field: 'emergencyContact.name',
        message: 'Emergency contact name must be less than 50 characters',
      })
    }
  }

  // Occupation and company validation
  if (data.occupation && data.occupation.length > 100) {
    errors.push({ field: 'occupation', message: 'Occupation must be less than 100 characters' })
  }

  if (data.company && data.company.length > 100) {
    errors.push({ field: 'company', message: 'Company name must be less than 100 characters' })
  }

  return errors
}

export function validateProfileUpdateRequest(req: NextRequest): {
  data: ProfileData
  errors: ProfileValidationError[]
} {
  try {
    const data = req.body as ProfileData
    const errors = validateProfileData(data)
    return { data, errors }
  } catch (error) {
    return {
      data: {},
      errors: [{ field: 'general', message: 'Invalid request data format' }],
    }
  }
}
