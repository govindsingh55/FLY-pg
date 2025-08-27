'use client'

import dynamic from 'next/dynamic'
import React from 'react'

const ResetPasswordClient = dynamic(() => import('./ResetPasswordClient'), { ssr: false })

export default function ResetPasswordClientWrapper({ token }: { token?: string }) {
  return <ResetPasswordClient token={token} />
}
