import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

/**
 * Settings Interface
 */
interface Settings {
  notifications: {
    email: boolean
    sms: boolean
    push: boolean
    bookingReminders: boolean
    paymentReminders: boolean
    maintenanceUpdates: boolean
  }
  autoPay: {
    enabled: boolean
    paymentMethod: string | null
    day: number
    maxAmount: number | null
    notifications: boolean
    lastUpdated: string | null
  }
  preferences: {
    darkMode: boolean
    language: string
    timezone: string
    dateFormat: string
    currency: string
  }
  privacy: {
    profileVisibility: string
    showEmail: boolean
    showPhone: boolean
    allowMarketingEmails: boolean
    twoFactorEnabled: boolean
    twoFactorMethod: string
    sessionTimeout: number
  }
  metadata: {
    settingsLastUpdated: string | null
  }
}

/**
 * Fetch customer settings
 */
const fetchSettings = async (): Promise<Settings> => {
  const response = await fetch('/api/custom/customers/settings')
  if (!response.ok) {
    throw new Error('Failed to fetch settings')
  }
  const data = await response.json()
  return data.settings
}

/**
 * Update customer settings
 */
const updateSettings = async (updates: Partial<Settings>): Promise<Settings> => {
  const response = await fetch('/api/custom/customers/settings', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.error || 'Failed to update settings')
  }

  const data = await response.json()
  return data.settings
}

/**
 * Hook to fetch customer settings
 *
 * Features:
 * - Automatic caching
 * - Background refetching
 * - Loading and error states
 */
export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

/**
 * Hook to update customer settings
 *
 * Features:
 * - Optimistic updates
 * - Automatic cache invalidation
 * - Success/error handling
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateSettings,

    // Optimistic update
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['settings'] })

      // Snapshot previous value
      const previousSettings = queryClient.getQueryData<Settings>(['settings'])

      // Optimistically update cache
      queryClient.setQueryData<Settings>(['settings'], (old) => {
        if (!old) return old
        return {
          ...old,
          ...newSettings,
          // Merge nested objects
          notifications: { ...old.notifications, ...newSettings.notifications },
          autoPay: { ...old.autoPay, ...newSettings.autoPay },
          preferences: { ...old.preferences, ...newSettings.preferences },
          privacy: { ...old.privacy, ...newSettings.privacy },
        } as Settings
      })

      // Return context with previous value
      return { previousSettings }
    },

    // On error, rollback to previous value
    onError: (error, _variables, context) => {
      if (context?.previousSettings) {
        queryClient.setQueryData(['settings'], context.previousSettings)
      }
      toast.error(error instanceof Error ? error.message : 'Failed to update settings')
    },

    // On success, show toast
    onSuccess: () => {
      toast.success('Settings saved successfully')
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] })
    },
  })
}

/**
 * Account action mutation hooks
 */

// Change Email
export function useChangeEmail() {
  return useMutation({
    mutationFn: async ({
      newEmail,
      currentPassword,
    }: {
      newEmail: string
      currentPassword: string
    }) => {
      const response = await fetch('/api/custom/customers/account/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail, currentPassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to change email')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Email address changed successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to change email')
    },
  })
}

// Change Password
export function useChangePassword() {
  return useMutation({
    mutationFn: async ({
      currentPassword,
      newPassword,
    }: {
      currentPassword: string
      newPassword: string
    }) => {
      const response = await fetch('/api/custom/customers/account/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to change password')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Password changed successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to change password')
    },
  })
}

// Change Phone
export function useChangePhone() {
  return useMutation({
    mutationFn: async ({ newPhone }: { newPhone: string }) => {
      const response = await fetch('/api/custom/customers/account/change-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPhone }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to change phone')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Phone number changed successfully')
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to change phone')
    },
  })
}

// Deactivate Account
export function useDeactivateAccount() {
  return useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/custom/customers/account/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to deactivate account')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Account deactivated successfully')
      setTimeout(() => {
        window.location.href = '/auth/sign-in'
      }, 2000)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to deactivate account')
    },
  })
}

// Delete Account
export function useDeleteAccount() {
  return useMutation({
    mutationFn: async ({ confirmation, password }: { confirmation: string; password: string }) => {
      const response = await fetch('/api/custom/customers/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete account')
      }

      return response.json()
    },
    onSuccess: () => {
      toast.success('Account deleted successfully')
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to delete account')
    },
  })
}
