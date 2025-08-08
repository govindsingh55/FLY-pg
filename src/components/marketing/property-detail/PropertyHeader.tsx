import * as React from 'react'
import * as Lucide from 'lucide-react'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'

type Props = {
  name: string
  propertyType?: string
  genderType?: string
  mapLink?: string
}

export default function PropertyHeader({ name, propertyType, genderType, mapLink }: Props) {
  return (
    <header className="mx-auto max-w-6xl px-4 pt-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{name}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {propertyType ? (
              <span className="inline-flex items-center rounded-full bg-secondary/30 px-2 py-0.5 text-xs">
                {propertyType}
              </span>
            ) : null}
            {genderType ? (
              <span className="inline-flex items-center rounded-full bg-secondary/30 px-2 py-0.5 text-xs">
                {genderType}
              </span>
            ) : null}
          </div>
        </div>
        {mapLink ? (
          <a
            href={mapLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-sm hover:bg-accent"
          >
            <Lucide.MapPin className="size-4" /> View in map
          </a>
        ) : null}
      </div>
    </header>
  )
}
