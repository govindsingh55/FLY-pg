'use client'

import { gallery } from '../../data'

export function Gallery() {
  return (
    <section className="mx-auto max-w-8xl w-full px-4 py-10">
      <h3 className="mb-4 text-xl font-semibold text-center">It&apos;s all Happening…</h3>
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        {gallery.map((g: any) => (
          <div key={g.id} className="group relative overflow-hidden rounded-2xl border bg-card">
            <img
              src={g.imageUrl}
              alt={g.title ?? 'Gallery'}
              className="h-44 w-full object-cover transition group-hover:scale-105"
            />
            {g.badge ? (
              <span className="absolute left-2 top-2 rounded-full bg-accent px-2 py-0.5 text-xs text-accent-foreground">
                {g.badge}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

export default Gallery
