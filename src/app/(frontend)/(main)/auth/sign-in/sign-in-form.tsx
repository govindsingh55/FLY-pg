'use client'

import { useState, useEffect } from 'react'
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
import { Eye, EyeOff } from 'lucide-react'

interface SignInFormProps {
  onSubmit?: ({
    email,
    password,
  }: {
    email: string
    password: string
  }) => Promise<{ success: boolean; user?: any; error?: string }>
}

export default function SignInForm({ onSubmit }: SignInFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()
  const { refetchUser, updateAuthAfterLogin } = useUser()
  const { setAuthLoading, setUnauthenticated, setAuthError } = useAuthActions()

  // Show success message if redirected after email verification
  useEffect(() => {
    if (searchParams.get('verified') === 'true') {
      toast.success('Email verified successfully!', {
        description: 'You can now sign in to your account.',
      })
      // Clean up URL
      const url = new URL(window.location.href)
      url.searchParams.delete('verified')
      window.history.replaceState({}, '', url.pathname + url.search)
    }
  }, [searchParams])

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
        const result = await onSubmit({ email, password })
        if (result.success && result.user) {
          // Immediately update the auth state with the user data from the server action
          updateAuthAfterLogin(result.user)
          toast('Sign in successful!')
          setSuccess(true)
          if (searchParams.get('redirect')) {
            router.replace(searchParams.get('redirect') as string)
          }
        } else {
          throw new Error(result.error || 'Sign in failed')
        }
      } else {
        // Legacy fallback removed: prefer server action. Keep minimal fallback if needed.
        await refetchUser()
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
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
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
          Don&apos;t have an account?{' '}
          <Link href="/auth/sign-up" className="ml-1 text-primary hover:underline">
            Sign up
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
