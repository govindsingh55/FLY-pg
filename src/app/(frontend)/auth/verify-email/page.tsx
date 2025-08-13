'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { resendVerificationPlaceholder } from './verify-email-action'
import { useAuthActions } from '@/lib/state/user'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

export default function VerifyEmailPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { setAuthLoading } = useAuthActions()

  async function handleResend(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    setLoading(true)
    setAuthLoading()
    try {
      const res = await resendVerificationPlaceholder()
      setMessage(res.error || 'Verification email resent (if account exists and not yet verified).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Check your email</CardTitle>
        <CardDescription>We sent a verification link to your inbox</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>
          Click the verification link in the email we just sent to complete your account setup. If
          you don't see it, check your spam folder.
        </p>
        <form onSubmit={handleResend} className="flex flex-col sm:flex-row gap-3 items-stretch">
          <input
            type="email"
            placeholder="you@example.com"
            className="flex-1 rounded-md border px-3 py-2 bg-background"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" variant="outline" disabled={loading}>
            {loading ? 'Sending…' : 'Resend email'}
          </Button>
        </form>
        {message && <p className="text-xs text-muted-foreground">{message}</p>}
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        Wrong email?{' '}
        <Link href="/auth/sign-up" className="ml-1 text-primary hover:underline">
          Go back
        </Link>
      </CardFooter>
    </Card>
  )
}
