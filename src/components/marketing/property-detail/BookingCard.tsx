'use client'

import * as React from 'react'
import * as Lucide from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePropertyDetail } from '@/lib/state/propertyDetail'

export type Room = {
  id: string
  name: string
  roomType: 'single' | 'two_sharing' | 'three_sharing'
  rent: number
  available?: boolean
}

export default function BookingCard({ rooms }: { rooms: Room[] }) {
  const { selectedSharingType, setSelectedSharingType, selectedRoomId, setSelectedRoomId } =
    usePropertyDetail()

  const filtered = React.useMemo(() => {
    if (selectedSharingType === 'all') return rooms
    return rooms.filter((r) => r.roomType === selectedSharingType)
  }, [rooms, selectedSharingType])

  return (
    <aside className="sticky top-24 h-fit rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Lucide.Home className="size-4" />
        <h3 className="font-semibold">Select Sharing Type</h3>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        {['all', 'single', 'two_sharing', 'three_sharing'].map((t) => (
          <button
            key={t}
            onClick={() => setSelectedSharingType(t as any)}
            className={`rounded-md border px-2 py-1 capitalize whitespace-nowrap ${
              selectedSharingType === t ? 'bg-primary text-primary-foreground' : 'bg-background'
            } ${t === 'all' ? 'col-span-3' : ''}`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="mt-4 max-h-80 overflow-auto space-y-2 pr-1">
        {filtered.map((r) => (
          <label
            key={r.id}
            className={`flex cursor-pointer items-center justify-between rounded-md border p-3 text-sm ${
              selectedRoomId === r.id ? 'border-primary' : ''
            }`}
          >
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-muted-foreground capitalize">{r.roomType.replace('_', ' ')}</div>
            </div>
            <div className="flex items-center gap-3">
              <div className="font-semibold">₹{r.rent.toLocaleString()}</div>
              <input
                type="radio"
                name="room"
                checked={selectedRoomId === r.id}
                onChange={() => setSelectedRoomId(r.id)}
              />
            </div>
          </label>
        ))}
        {filtered.length === 0 ? (
          <div className="text-sm text-muted-foreground">No rooms for this type.</div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button variant="outline">Schedule a visit</Button>
        <Button>Confirm details</Button>
      </div>
    </aside>
  )
}
