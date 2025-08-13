'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
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
import { toast } from 'sonner'
import { resetPasswordAction } from '../auth-actions'
import { useAuthActions } from '@/lib/state/user'

export default function ResetPasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''
  const { setAuthLoading, setAuthError } = useAuthActions()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    setAuthLoading()
    const formData = new FormData(e.currentTarget)
    formData.set('token', token)
    const result = await resetPasswordAction(formData)
    setLoading(false)
    if (result?.success) {
      toast('Password reset successful! You can now sign in.', {
        description: 'Your password has been updated.',
        duration: 6000,
      })
      setSuccess(true)
    } else {
      const msg = typeof result.error === 'string' ? result.error : JSON.stringify(result.error)
      setError(msg)
      setAuthError(msg)
    }
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>Enter your new password below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {success ? (
          <div className="flex flex-col items-center justify-center min-h-[180px] text-center gap-4">
            <div className="text-green-600 text-lg font-semibold">Password reset successful!</div>
            <div className="text-muted-foreground">
              You can now{' '}
              <Link href="/auth/sign-in" className="text-primary hover:underline">
                sign in
              </Link>
              .
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                minLength={6}
                required
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password'}
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
