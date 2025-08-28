'use client'

import { useState } from 'react'

interface RefreshStatusButtonProps {
  paymentId: string
}

export function RefreshStatusButton({ paymentId }: RefreshStatusButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleRefresh = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${window.location.origin}/api/custom/customers/payments/${paymentId}/status`,
        { cache: 'no-store' },
      )
      if (response.ok) {
        window.location.reload()
      }
    } catch (e) {
      console.error('Failed to check status:', e)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleRefresh}
      disabled={isLoading}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed mr-2"
    >
      {isLoading ? 'Checking...' : 'Refresh Status'}
    </button>
  )
}
