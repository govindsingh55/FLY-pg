'use client'

import { testimonials } from '../../data'

export function TestimonialWall() {
  return (
    <section id="community" className="mx-auto max-w-6xl px-4 py-10">
      <h3 className="mb-6 text-center text-xl font-semibold">
        Let&apos;s hear it from our residents
      </h3>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {testimonials.map((t: any) => (
          <div key={t.id} className="rounded-xl border bg-card p-4">
            <div className="text-sm font-semibold">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.role}</div>
            <p className="mt-2 text-sm">{t.text}</p>
            {t.tag ? (
              <span className="mt-3 inline-block rounded-full bg-cream px-2 py-0.5 text-xs text-foreground">
                {t.tag}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}

export default TestimonialWall
