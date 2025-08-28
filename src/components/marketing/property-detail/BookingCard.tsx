'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { usePropertyDetail } from '@/lib/state/propertyDetail'
import { useUser } from '@/lib/state/user'
import * as Lucide from 'lucide-react'
import Link from 'next/link'
import * as React from 'react'
import RoomBookingForm from './RoomBookingForm'
import VisitBookingForm from './VisitBookingForm'

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
  const [openVisit, setOpenVisit] = React.useState(false)
  const [openBook, setOpenBook] = React.useState(false)
  const [selectedRoomId, setSelectedRoomId] = React.useState<string | null>(null)
  const userData = useUser()

  // Room filtering logic retained for future use, but not shown in UI

  React.useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const update = () => setIsDesktop(mql.matches)
    update()
    mql.addEventListener('change', update)
    return () => mql.removeEventListener('change', update)
  }, [])

  const filteredRooms = rooms.filter(
    (r) => selectedSharingType === 'all' || r.roomType === selectedSharingType,
  )
  const selectedRoom =
    filteredRooms.find((r) => r.id === selectedRoomId) ||
    rooms.find((r) => r.id === selectedRoomId) ||
    null

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
        {filteredRooms.map((r) => {
          const selected = selectedRoomId === r.id
          return (
            <button
              key={r.id}
              onClick={() => setSelectedRoomId(r.id)}
              className={`w-full text-left flex items-center justify-between rounded-md border p-3 text-sm transition-colors ${
                selected ? 'border-primary bg-primary/5' : 'hover:bg-muted'
              } ${r.available === false ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={r.available === false}
              aria-pressed={selected}
            >
              <div>
                <div className="font-medium">{r.name}</div>
                <div className="text-muted-foreground capitalize">
                  {r.roomType.replace('_', ' ')}
                </div>
              </div>
              <div className="font-semibold">₹{r.rent.toLocaleString()}</div>
            </button>
          )
        })}
        {filteredRooms.length === 0 ? (
          <div className="text-sm text-muted-foreground">No rooms for this type.</div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-2">
        <Button variant="outline" className="cursor-pointer" onClick={() => setOpenVisit(true)}>
          Schedule a visit
        </Button>
        <Button
          disabled={!selectedRoomId}
          onClick={() => {
            if (!userData.isAuthenticated) {
              setAuthPromptOpen(true)
              return
            }
            setOpenBook(true)
          }}
        >
          Book
        </Button>
      </div>

      {/* Responsive container: Drawer on mobile, Sheet on desktop */}
      {!isDesktop ? (
        <Drawer open={openVisit} onOpenChange={setOpenVisit}>
          <DrawerContent className="data-[vaul-drawer-direction=bottom]:rounded-t-2xl">
            <DrawerHeader className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Lucide.Calendar className="size-4" />
                <DrawerTitle className="text-sm font-medium">Schedule a visit</DrawerTitle>
              </div>
            </DrawerHeader>
            <VisitBookingForm propertyId={propertyId} onClose={() => setOpenVisit(false)} />
            <DrawerFooter />
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={openVisit} onOpenChange={setOpenVisit}>
          <SheetContent side="right">
            <SheetHeader className="flex items-center justify-between border-b px-4 py-4">
              <div className="flex items-center gap-2">
                <Lucide.Calendar className="size-4" />
                <SheetTitle className="text-sm font-medium">Schedule a visit</SheetTitle>
              </div>
            </SheetHeader>
            <VisitBookingForm propertyId={propertyId} onClose={() => setOpenVisit(false)} />
            {/* <SheetFooter /> */}
          </SheetContent>
        </Sheet>
      )}

      {/* Book Drawer/Sheet */}
      {!isDesktop ? (
        <Drawer open={openBook} onOpenChange={setOpenBook}>
          <DrawerContent className="data-[vaul-drawer-direction=bottom]:rounded-t-2xl">
            <DrawerHeader className="flex items-center justify-between border-b px-4 py-3">
              <div className="flex items-center gap-2">
                <Lucide.Calendar className="size-4" />
                <DrawerTitle className="text-sm font-medium">Book this room</DrawerTitle>
              </div>
            </DrawerHeader>
            {selectedRoom ? (
              <RoomBookingForm
                room={selectedRoom}
                propertyId={propertyId}
                onClose={() => setOpenBook(false)}
              />
            ) : null}
            <DrawerFooter />
          </DrawerContent>
        </Drawer>
      ) : (
        <Sheet open={openBook} onOpenChange={setOpenBook}>
          <SheetContent side="right">
            <SheetHeader className="flex items-center justify-between border-b px-4 py-4">
              <div className="flex items-center gap-2">
                <Lucide.Calendar className="size-4" />
                <SheetTitle className="text-sm font-medium">Book this room</SheetTitle>
              </div>
            </SheetHeader>
            {selectedRoom ? (
              <RoomBookingForm
                room={selectedRoom}
                propertyId={propertyId}
                onClose={() => setOpenBook(false)}
              />
            ) : null}
            {/* <SheetFooter /> */}
          </SheetContent>
        </Sheet>
      )}

      {/* Auth prompt for guests */}
      <AuthPromptDialog />
    </aside>
  )
}

function AuthPromptDialog() {
  const [open, setOpen] = React.useState(false)
  // Expose setter via global event to avoid prop drilling
  React.useEffect(() => {
    function onOpenAuthPrompt() {
      setOpen(true)
    }
    window.addEventListener('open-auth-prompt', onOpenAuthPrompt as any)
    return () => window.removeEventListener('open-auth-prompt', onOpenAuthPrompt as any)
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>
            Please sign in or create an account to book a room. You can still schedule a visit as a
            guest.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button asChild variant="outline">
            <Link href="/auth/sign-up">Create account</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-in">Sign in</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Helper to trigger auth prompt from within component
function setAuthPromptOpen(val: boolean) {
  if (val) window.dispatchEvent(new Event('open-auth-prompt'))
}
