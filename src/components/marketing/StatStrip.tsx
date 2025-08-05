'use client'

import * as React from 'react'
import { stats } from '../../data'

export function StatStrip() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid grid-cols-3 gap-4 rounded-2xl border bg-card p-6 text-center max-sm:grid-cols-1">
        {stats.map((s: { id: string; value: string; label: string }) => (
          <div key={s.id} className="flex flex-col items-center">
            <div className="text-3xl font-bold text-primary">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default StatStrip
