'use client'

import * as React from 'react'
import * as Lucide from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePropertyDetail } from '@/lib/state/propertyDetail'
import VisitBookingForm from './VisitBookingForm'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'

export type Room = {
  id: string
  name: string
  roomType: 'single' | 'two_sharing' | 'three_sharing'
  rent: number
  available?: boolean
}

type Props = { rooms: Room[]; propertyId?: string }

export default function BookingCard({ rooms, propertyId }: Props) {
  const { selectedSharingType, setSelectedSharingType } = usePropertyDetail()
  const [isDesktop, setIsDesktop] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  // Room filtering logic retained for future use, but not shown in UI

  React.useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

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
        {rooms
          .filter((r) => selectedSharingType === 'all' || r.roomType === selectedSharingType)
          .map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-md border p-3 text-sm"
            >
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-muted-foreground capitalize">
                  {r.roomType.replace('_', ' ')}
                </div>
              </div>
              <div className="font-semibold">₹{r.rent.toLocaleString()}</div>
            </div>
          ))}
        {rooms.filter((r) => selectedSharingType === 'all' || r.roomType === selectedSharingType)
          .length === 0 ? (
          <div className="text-sm text-muted-foreground">No rooms for this type.</div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-2">
        <Button variant="outline" className="cursor-pointer" onClick={() => setOpen(true)}>
          Schedule a visit
        </Button>
        <Button>Confirm details</Button>
      </div>

      {/* Responsive container: Drawer on mobile, Sheet on desktop */}
      {!isDesktop ? (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent className="data-[vaul-drawer-direction=bottom]:rounded-t-2xl">
            <DrawerHeader className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Lucide.Calendar className="size-4" />
                <DrawerTitle className="text-sm font-medium">Schedule a visit</DrawerTitle>
              </div>
            </DrawerHeader>
            <VisitBookingForm propertyId={propertyId} onClose={() => setOpen(false)} />
            <DrawerFooter />
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="right">
            <SheetHeader className="flex items-center justify-between border-b px-4 py-4">
              <div className="flex items-center gap-2">
                <Lucide.Calendar className="size-4" />
                <SheetTitle className="text-sm font-medium">Schedule a visit</SheetTitle>
              </div>
            </SheetHeader>
            <VisitBookingForm propertyId={propertyId} onClose={() => setOpen(false)} />
            {/* <SheetFooter /> */}
          </SheetContent>
        </Sheet>
      )}
    </aside>
  )
}
