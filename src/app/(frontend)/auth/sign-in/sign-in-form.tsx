'use client'

import { useState } from 'react'
import { useUser, useAuthActions } from '@/lib/state/user'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { OrDivider, SocialAuthButton } from '../_components/SocialAuth'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter, useSearchParams } from 'next/navigation'

interface SignInFormProps {
  onSubmit?: ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => Promise<{ success: boolean }>
  collection?: 'customers' | 'users'
}

export default function SignInForm({ onSubmit, collection = 'customers' }: SignInFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refetchUser } = useUser()
  const { setAuthLoading, setAuthenticated, setUnauthenticated, setAuthError } = useAuthActions()
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    try {
      setAuthLoading()
      if (onSubmit) {
        await onSubmit({ email, password })
        // After server action sets auth cookies, pull fresh user
        await refetchUser()
      } else {
        // Legacy fallback removed: prefer server action. Keep minimal fallback if needed.
        await refetchUser()
      }
      toast('Sign in successful!')
      setSuccess(true)
      if (searchParams.get('redirect')) {
        router.replace(searchParams.get('redirect') as string)
      }
    } catch (err: any) {
      console.error('Sign in error:', err)
      const msg = err.message || 'Sign in failed'
      setError(msg)
      setAuthError(msg)
      setUnauthenticated()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full h-full">
      <Card>
        <CardHeader className="items-center text-center">
          <CardTitle className="text-2xl">Sign in to your account</CardTitle>
          <CardDescription>Welcome back to FLY</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {success ? (
            <div className="flex flex-col items-center justify-center min-h-[180px] text-center gap-4 h-full">
              <div className="text-green-600 text-lg font-semibold">Sign in successful!</div>
              <div className="text-muted-foreground">
                Redirecting you...{' '}
                <Link href="/" className="text-primary hover:underline">
                  Go home
                </Link>
              </div>
            </div>
          ) : (
            <>
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
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="text-sm font-medium">
                      Password
                    </label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              <OrDivider />
              <SocialAuthButton>Sign in with Google</SocialAuthButton>
            </>
          )}
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/auth/sign-up" className="ml-1 text-primary hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
