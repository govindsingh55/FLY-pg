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
import { OrDivider, SocialAuthButton } from '../_components/SocialAuth'

export default function SignUpPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create your account</CardTitle>
        <CardDescription>Join FLY to get started</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault()
          }}
        >
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full name
            </label>
            <Input id="name" type="text" placeholder="Jane Doe" required />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              inputMode="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" required />
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

          <Button type="submit" className="w-full">
            Create account
          </Button>
        </form>

        <OrDivider />

        <SocialAuthButton>Sign up with Google</SocialAuthButton>
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
