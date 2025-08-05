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

export default function VerifyEmailResultPage() {
  // Static UI: in a real app, you'd read query like ?status=success|error and branch UI
  const status: 'success' | 'error' = 'success'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">
          {status === 'success' ? 'Email verified' : 'Verification failed'}
        </CardTitle>
        <CardDescription>
          {status === 'success'
            ? 'Your email has been successfully verified.'
            : 'We could not verify your email. The link may be invalid or expired.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {status === 'success' ? (
          <p>You can now sign in to your account.</p>
        ) : (
          <p>
            Please request a new verification email from your account or sign up again if needed.
          </p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/auth/verify-email">Back</Link>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/auth/sign-in">Go to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
