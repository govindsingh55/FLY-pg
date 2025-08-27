'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'
import { OrDivider, SocialAuthButton } from '../_components/SocialAuth'
import { signUpAction } from '../auth-actions'
import { useAuthActions } from '@/lib/state/user'
import { Eye, EyeOff } from 'lucide-react'

export default function SignUpForm() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { setAuthLoading, setAuthError, setUnauthenticated } = useAuthActions()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setAuthLoading()
    const formData = new FormData(e.currentTarget)
    try {
      const result = await signUpAction(formData)
      if (result?.success) {
        toast('Sign up successful! Please check your email to verify your account.', {
          description: 'A verification link has been sent to your email address.',
          duration: 6000,
        })
        setSuccess(true)
        // Remain unauthenticated until email verification
        setUnauthenticated()
      } else {
        const msg = typeof result.error === 'string' ? result.error : JSON.stringify(result.error)
        setError(msg)
        setAuthError(msg)
        setUnauthenticated()
      }
    } catch (err: any) {
      const msg = err.message || 'Sign up failed'
      setError(msg)
      setAuthError(msg)
      setUnauthenticated()
    }
  }

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Join FLY to get started</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {success ? (
          <div className="flex flex-col items-center justify-center min-h-[220px] text-center gap-4">
            <div className="text-green-600 text-lg font-semibold">Sign up successful!</div>
            <div className="text-muted-foreground">
              Please check your email and verify your account to{' '}
              <Link href="/auth/sign-in" className="text-primary hover:underline">
                continue
              </Link>
              .
            </div>
          </div>
        ) : (
          <>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Full name
                </label>
                <Input id="name" name="name" type="text" placeholder="Jane Doe" required />
              </div>

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
                <label htmlFor="phone" className="text-sm font-medium">
                  Phone (optional)
                </label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]{10}"
                  maxLength={10}
                  placeholder="e.g. 9876543210"
                  autoComplete="tel"
                />
                <p className="text-xs text-muted-foreground">
                  Providing your 10-digit phone number helps us reach you faster if needed.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
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

              <div className="flex items-start gap-2 text-sm">
                <input id="terms" type="checkbox" className="mt-1" />
                <label htmlFor="terms" className="text-muted-foreground">
                  I agree to the{' '}
                  <Link className="text-primary underline underline-offset-4" href="#">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link className="text-primary underline underline-offset-4" href="#">
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>

              {error && <div className="text-red-500 text-sm">{error}</div>}

              <Button type="submit" className="w-full">
                Create account
              </Button>
            </form>

            <OrDivider />

            <SocialAuthButton>Sign up with Google</SocialAuthButton>
          </>
        )}
      </CardContent>

      <CardFooter className="justify-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/auth/sign-in" className="ml-1 text-primary hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  )
}
