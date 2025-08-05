'use client'

import Link from 'next/link'
import { press } from '../../data'

export function PressLogos() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 pb-24 md:pb-10">
      <h3 className="mb-4 text-center text-xl font-semibold">The Spotlight</h3>
      <div className="flex flex-wrap items-center justify-center gap-6">
        {press.map((p: any) => (
          <Link key={p.id} href={p.href ?? '#'} className="opacity-70 hover:opacity-100 transition">
            <img
              src={p.imageUrl}
              alt={p.name}
              className="h-12 w-auto object-contain grayscale"
              loading="lazy"
            />
          </Link>
        ))}
      </div>
    </section>
  )
}

export default PressLogos
