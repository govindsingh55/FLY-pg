'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const ForgotPasswordClient = dynamic(() => import('./ForgotPasswordClient'), { ssr: false })

export default function ForgotPasswordClientWrapper() {
  return <ForgotPasswordClient />
}
