'use client'

import { Button } from '@/components/ui/button'

export default function FiltersTrigger() {
  return (
    <Button
      variant="outline"
      onClick={() => document.dispatchEvent(new CustomEvent('open-filters'))}
    >
      Filters
    </Button>
  )
}
