'use client'
import { Button } from '@/components/ui/button'
import { useUser } from '@/lib/state/user'

export function LogoutButton({ className }: { className?: string }) {
  const { logout, isAuthenticated } = useUser()
  if (!isAuthenticated) return null
  return (
    <Button variant="outline" size="lg" className={className} onClick={() => logout()}>
      Logout
    </Button>
  )
}
