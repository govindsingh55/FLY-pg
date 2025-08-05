'use client'

import * as Lucide from 'lucide-react'

export default function IconByName({ name, className }: { name: string; className?: string }) {
  const Comp =
    ((Lucide as unknown as Record<string, React.ComponentType<any>>)[name] as React.ComponentType<{
      className?: string
    }>) || (Lucide.Square as unknown as React.ComponentType<{ className?: string }>)
  return <Comp className={className} />
}
