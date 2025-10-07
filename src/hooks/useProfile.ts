import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Customer Profile Interface
 */
export interface CustomerProfile {
  id: string
  name: string
  email: string
  phone?: string
  status?: string
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
  profilePicture?: {
    url?: string
  }
  avatar?: {
    url?: string
  }
  preferences?: {
    darkMode: boolean
    language: string
    timezone: string
    dateFormat: string
    currency: string
  }
  privacySettings?: {
    profileVisibility: string
    showEmail: boolean
    showPhone: boolean
    allowMarketingEmails: boolean
    twoFactorEnabled: boolean
    twoFactorMethod: string
    sessionTimeout: number
  }
  notificationPreferences?: {
    emailNotifications: boolean
    smsNotifications: boolean
    pushNotifications: boolean
    bookingReminders: boolean
    paymentReminders: boolean
    maintenanceUpdates: boolean
  }
  createdAt?: string
  updatedAt?: string
}

/**
 * Fetch customer profile
 */
const fetchProfile = async (): Promise<CustomerProfile> => {
  const response = await fetch('/api/custom/customers/profile')

  if (!response.ok) {
    throw new Error('Failed to fetch profile')
  }

  const data = await response.json()
  return data.customer
}

/**
 * Update customer profile
 */
const updateProfile = async (updates: Partial<CustomerProfile>): Promise<CustomerProfile> => {
  const response = await fetch('/api/custom/customers/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update profile')
  }

  const data = await response.json()
  return data.customer
}

/**
 * Hook to fetch customer profile
 *
 * Features:
 * - Automatic caching (5 minutes stale time)
 * - Background refetching
 * - Loading and error states
 */
export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to update customer profile
 *
 * Features:
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Success/error handling
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProfile,

    // Optimistic update
    onMutate: async (newProfile) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['profile'] })

      // Snapshot previous value
      const previousProfile = queryClient.getQueryData<CustomerProfile>(['profile'])

      // Optimistically update cache
      queryClient.setQueryData<CustomerProfile>(['profile'], (old) => {
        if (!old) return old
        return { ...old, ...newProfile }
      })

      // Return context with previous value
      return { previousProfile }
    },

    // On error, rollback to previous value
    onError: (error, _variables, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile'], context.previousProfile)
      }
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    },

    // On success, show toast
    onSuccess: () => {
      toast.success('Profile updated successfully')
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] })
    },
  })
}
