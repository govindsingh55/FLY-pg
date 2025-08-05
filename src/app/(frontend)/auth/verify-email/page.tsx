'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

export default function VerifyEmailPage() {
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

        <form
          onSubmit={(e) => e.preventDefault()}
          className="flex items-center justify-between gap-3"
        >
          <span>Didn't receive an email?</span>
          <Button type="submit" variant="outline">
            Resend email
          </Button>
        </form>
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
