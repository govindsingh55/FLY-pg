'use client'

import Link from 'next/link'
import { Button } from '../../components/ui/button'
import { appPromo } from '../../data'

export function AppPromo() {
  const d = appPromo
  return (
    <section id="download" className="mx-auto max-w-6xl px-4 py-12 pb-28 md:pb-12">
      <div className="grid gap-6 md:grid-cols-2 items-center rounded-2xl border bg-card p-6">
        <div>
          <h3 className="text-2xl font-semibold">{d.title}</h3>
          <p className="mt-2 text-muted-foreground">{d.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {d.ctas.map((c) => (
              <Button
                key={c.label}
                asChild
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              >
                <Link href={c.href}>{c.label}</Link>
              </Button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[120px,1fr] items-center gap-4">
          <img src={d.qrImageUrl} alt="QR" className="rounded-md border" />
          <div className="relative h-48 w-full overflow-hidden rounded-xl">
            <img
              src={d.appImages[0]}
              alt="App screenshot"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppPromo
