'use client'

import React, { createContext, useContext, useMemo, useState } from 'react'

type SharingType = 'single' | 'two_sharing' | 'three_sharing' | 'all'

type PropertyDetailState = {
  selectedSharingType: SharingType
  setSelectedSharingType: (t: SharingType) => void
  selectedRoomId?: string
  setSelectedRoomId: (id?: string) => void
}

const Ctx = createContext<PropertyDetailState | null>(null)

export function PropertyDetailProvider({ children }: { children: React.ReactNode }) {
  const [selectedSharingType, setSelectedSharingType] = useState<SharingType>('all')
  const [selectedRoomId, setSelectedRoomId] = useState<string | undefined>(undefined)

  const value = useMemo<PropertyDetailState>(
    () => ({ selectedSharingType, setSelectedSharingType, selectedRoomId, setSelectedRoomId }),
    [selectedSharingType, selectedRoomId],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePropertyDetail() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('usePropertyDetail must be used inside PropertyDetailProvider')
  return ctx
}
