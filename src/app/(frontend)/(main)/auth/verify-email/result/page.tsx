import { verifyEmailAction } from '../verify-email-action'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'

interface Props {
  // Next's generated types expect `searchParams` to be a Promise<any> in PageProps.
  // Declare it as an optional Promise so the component's type satisfies Next's PageProps.
  searchParams?: Promise<{ token?: string }>
}

export default async function VerifyEmailResultPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const token = resolvedSearchParams?.token
  const result = token ? await verifyEmailAction(token) : { error: 'Missing token' }
  const success = !!result.success

  // Automatically redirect to sign-in after successful verification
  if (success) {
    redirect('/auth/sign-in?verified=true')
  }

  // Only show error state - success redirects immediately
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Verification failed</CardTitle>
        <CardDescription>
          {result.error || 'We could not verify your email. The link may be invalid or expired.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-muted-foreground">
        <p>Please request a new verification email from your account or sign up again if needed.</p>
      </CardContent>
      <CardFooter className="flex flex-col gap-3 sm:flex-row sm:justify-between">
        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/auth/verify-email">Request new email</Link>
        </Button>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/auth/sign-in">Go to sign in</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
