'use client'

import { useFilterActions } from '@/components/marketing/FilterContext'
import { Button } from '@/components/ui/button'

export default function FiltersTrigger() {
  const actions = useFilterActions()
  return (
    <Button variant="outline" onClick={() => actions.toggleFilterPanel(true)}>
      Filters
    </Button>
  )
}
