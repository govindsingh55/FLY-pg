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

type MagicState = 'sent' | 'clicked' | 'expired'

export default function MagicLinkPage() {
  // Static UI: replace with actual states like "sent" | "clicked" | "expired"
  const state: MagicState = 'sent'

  const titleMap: Record<MagicState, string> = {
    sent: 'Check your email',
    clicked: 'Link accepted',
    expired: 'Link expired',
  }

  const descriptionMap: Record<MagicState, string> = {
    sent: 'We just sent a magic link to your inbox. Click it to continue.',
    clicked: 'You can now proceed to sign in.',
    expired: 'Your link has expired. Request a new one below.',
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{titleMap[state]}</CardTitle>
        <CardDescription>{descriptionMap[state]}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-sm text-muted-foreground">
        {state === 'sent' ? (
          <p>If you don't see an email, check your spam folder.</p>
        ) : state === 'clicked' ? (
          <p>Continue to sign in to your account.</p>
        ) : (
          <p>Request a fresh link from the sign-in page.</p>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/auth/sign-in">Back to sign in</Link>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/auth/sign-up">Create account</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
