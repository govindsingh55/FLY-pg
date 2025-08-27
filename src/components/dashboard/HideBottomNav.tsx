'use client'

import { useEffect } from 'react'

export function HideBottomNav() {
  useEffect(() => {
    // Add class to hide bottom nav on dashboard pages
    document.body.classList.add('dashboard-active')

    return () => {
      // Remove class when component unmounts
      document.body.classList.remove('dashboard-active')
    }
  }, [])

  return null
}
