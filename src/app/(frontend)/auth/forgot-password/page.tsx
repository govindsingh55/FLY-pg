'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { useState } from 'react'
import { toast } from 'sonner'
import { forgotPasswordAction } from './forgot-password-action'

export default function ForgotPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fallbackLink, setFallbackLink] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await forgotPasswordAction(formData)
    setLoading(false)
    if (result?.success) {
      toast('Password reset link sent! Please check your email.', {
        description: 'A reset link has been sent to your email address.',
        duration: 6000,
      })
      setSuccess(true)
      if (result.fallback && result.resetLink) {
        setFallbackLink(result.resetLink)
      } else {
        setFallbackLink(null)
      }
    } else {
      setError(typeof result.error === 'string' ? result.error : JSON.stringify(result.error))
    }
  }

  return (
    <Card className="md:mt-14">
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl">Forgot password</CardTitle>
        <CardDescription>We will send you a link to reset your password</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {success ? (
          <div className="flex flex-col items-center justify-center min-h-[180px] text-center gap-4">
            <div className="text-green-600 text-lg font-semibold">Password reset link sent!</div>
            <div className="text-muted-foreground">
              Please check your email to reset your password.
            </div>
            {fallbackLink && (
              <div className="text-left mt-4 p-3 rounded-md border w-full bg-muted/40">
                <div className="text-xs font-semibold mb-1">Dev fallback link (email blocked):</div>
                <a
                  href={fallbackLink}
                  className="break-all text-xs text-primary underline"
                  rel="nofollow noopener"
                >
                  {fallbackLink}
                </a>
                <div className="text-[10px] mt-2 text-muted-foreground">
                  Visible only because ALLOW_EMAIL_403_FALLBACK is enabled & email send failed.
                  Remove this once email sending works.
                </div>
              </div>
            )}
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending...' : 'Send reset link'}
            </Button>
          </form>
        )}
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        Remembered your password?{' '}
        <Link href="/auth/sign-in" className="ml-1 text-primary hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
