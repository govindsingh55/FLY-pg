'use client'

import * as Lucide from 'lucide-react'
import { useRouter } from 'next/navigation'

type Props = {
  name: string
  propertyType?: string
  genderType?: string
  mapLink?: string
  onBack?: () => void
}

export default function PropertyHeader({ name, propertyType, genderType, mapLink, onBack }: Props) {
  const router = useRouter()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      router.back()
    }
  }

  return (
    <header className="mx-auto max-w-8xl w-full px-4 pt-4">
      <div className="flex items-center justify-between">
        <button
          onClick={handleBack}
          className="inline-flex items-center justify-center rounded-md border bg-background p-2 hover:bg-accent"
          aria-label="Go back"
        >
          <Lucide.ArrowLeft className="size-4" />
        </button>
        {mapLink ? (
          <a
            href={mapLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-accent text-white px-3 py-2 text-sm"
          >
            <Lucide.MapPin className="size-4" /> View in map
          </a>
        ) : null}
      </div>
      <div className="flex flex-wrap items-start justify-between gap-3 mt-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3 justify-between w-full">
          <h1 className="text-3xl font-semibold tracking-tight">{name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {propertyType ? (
              <span className="inline-flex items-center rounded-full bg-secondary/30 px-4 py-1 text-xs">
                {propertyType}
              </span>
            ) : null}
            {genderType ? (
              <span className="inline-flex items-center rounded-full bg-secondary/30 px-4 py-1 text-xs">
                {genderType}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
