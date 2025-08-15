'use client'

import React, { useCallback } from 'react'
import { parseAsString, parseAsStringEnum, parseAsInteger, useQueryStates } from 'nuqs'
import { usePathname, useRouter } from 'next/navigation'

// Types
export type TypeValue = 'pg' | 'hostel' | 'apartment'
export type SharingValue = 'single' | 'two' | 'three'
export type SortValue = 'newest' | 'price_asc' | 'price_desc'
// Nuqs parsers for query param sync
const parsers = {
  q: parseAsString.withDefault(''),
  city: parseAsString.withDefault(''),
  type: parseAsStringEnum<TypeValue>(['pg', 'hostel', 'apartment']).withDefault('apartment'),
  sharing: parseAsStringEnum<SharingValue>(['single', 'two', 'three']).withDefault('single'),
  minPrice: parseAsInteger.withDefault(0),
  maxPrice: parseAsInteger.withDefault(0),
  roomType: parseAsString.withDefault(''),
  amenities: parseAsString.withDefault(''),
  sort: parseAsStringEnum<SortValue>(['newest', 'price_asc', 'price_desc']).withDefault('newest'),
  page: parseAsInteger.withDefault(1),
}

// Raw query-synced value shape (nuqs returns typed values inferred from parsers)
type QueryValues = {
  readonly [K in keyof typeof parsers]: ReturnType<(typeof parsers)[K]['parse']> | null
}

// UI / reducer state (adds local UI flags)
export interface FilterUIState extends QueryValues {
  isFilterPanelOpen: boolean
  isFilterApplied: boolean
}

// Action definitions
export type FilterAction =
  | { type: typeof FilterActionTypes.SET_FILTER; payload: Partial<QueryValues> }
  | { type: typeof FilterActionTypes.CLEAR_FILTER }
  | { type: typeof FilterActionTypes.TOGGLE_FILTER_PANEL; payload?: boolean }
  | { type: typeof FilterActionTypes.SET_FILTER_APPLIED; payload: boolean }

// Context value types
export interface FilterStateContextValue extends FilterUIState {}
export interface FilterActionsContextValue {
  setParams: (
    next: Partial<Record<keyof typeof parsers, string | number | null | undefined>>,
  ) => void
  clearAll: () => void
  setFilters: (filters: Partial<QueryValues>) => void
  toggleFilterPanel: (value?: boolean) => void
  setFilterApplied: (value: boolean) => void
}

const FilterStateContext = React.createContext<FilterStateContextValue | undefined>(undefined)
const FilterDispatchContext = React.createContext<FilterActionsContextValue | undefined>(undefined)

const reducer = (state: FilterUIState, action: FilterAction): FilterUIState => {
  switch (action.type) {
    case FilterActionTypes.SET_FILTER:
      console.log('SET_FILTER', action.payload)
      return { ...state, ...action.payload }
    case FilterActionTypes.CLEAR_FILTER: {
      // Reset only query related values, preserve UI flags
      return {
        ...state,
        q: null,
        city: null,
        type: null,
        sharing: null,
        minPrice: null,
        maxPrice: null,
        roomType: null,
        amenities: null,
        sort: 'newest',
        page: 1,
      }
    }
    case FilterActionTypes.TOGGLE_FILTER_PANEL:
      return { ...state, isFilterPanelOpen: action.payload ?? !state.isFilterPanelOpen }
    case FilterActionTypes.SET_FILTER_APPLIED:
      return { ...state, isFilterApplied: action.payload }
    default:
      return state
  }
}

export const FilterActionTypes = {
  SET_FILTER: 'SET_FILTER',
  CLEAR_FILTER: 'CLEAR_FILTER',
  TOGGLE_FILTER_PANEL: 'TOGGLE_FILTER_PANEL',
  SET_FILTER_APPLIED: 'SET_FILTER_APPLIED',
} as const

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [values, setValues] = useQueryStates(parsers, { history: 'replace', shallow: true })

  const initialUI: FilterUIState = React.useMemo(
    () => ({
      ...(values as QueryValues),
      isFilterPanelOpen: false,
      isFilterApplied: false,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [], // initialize once – values is reactive via nuqs outside reducer
  )

  const [reducerState, dispatch] = React.useReducer(reducer, initialUI)

  const setParams = useCallback(
    (next: Partial<Record<keyof typeof parsers, string | number | null | undefined>>) => {
      const patch: any = {}
      for (const [k, vRaw] of Object.entries(next)) {
        const key = k as keyof typeof parsers
        let v: any = vRaw
        if (typeof v === 'string') {
          const trimmed = v.trim()
          v = trimmed.length ? trimmed : null
        }
        if (key === 'minPrice' || key === 'maxPrice' || key === 'page') {
          if (typeof v === 'string') {
            const n = Number.parseInt(v, 10)
            v = Number.isFinite(n) ? n : null
          }
          if (typeof v === 'number' && !Number.isFinite(v)) v = null
        }
        patch[key] = v === undefined ? null : v
      }
      // page reset to 1 on any filter update except when explicitly provided
      if (!('page' in next)) {
        patch.page = 1
      }
      // ensure default sort when explicitly unset
      if ('sort' in next && (next as any).sort == null) {
        patch.sort = 'newest'
      }
      setValues(patch)
    },
    [setValues],
  )

  const setFilters = useCallback(
    (filters: Partial<QueryValues>) => {
      dispatch({ type: FilterActionTypes.SET_FILTER, payload: filters })
      // Note: reducerState updates asynchronously; logging here will show the previous state.
      console.log('dispatched SET_FILTER with', filters)
    },
    [dispatch],
  )

  const toggleFilterPanel = useCallback(
    (value?: boolean) => {
      dispatch({ type: FilterActionTypes.TOGGLE_FILTER_PANEL, payload: value })
    },
    [dispatch],
  )

  const setFilterApplied = useCallback(
    (value: boolean) => {
      console.log('Setting filter applied:', value, reducerState)
      dispatch({ type: FilterActionTypes.SET_FILTER_APPLIED, payload: value })
      // Sync only parser-backed keys to the URL/search params
      const { q, city, type, sharing, minPrice, maxPrice, roomType, amenities, sort } = reducerState
      // If not already on /properties, redirect with query string to avoid racing setParams
      if (!pathname || !pathname.startsWith('/properties')) {
        console.log('Redirecting to /properties')
        const qs = new URLSearchParams()
        const add = (key: string, val: string | number | null | undefined) => {
          if (val === null || val === undefined) return
          if (typeof val === 'string') {
            const t = val.trim()
            if (!t) return
            qs.set(key, t)
          } else if (Number.isFinite(val as number)) {
            if ((val as number) === 0) return
            qs.set(key, String(val))
          }
        }
        add('q', q ?? undefined)
        add('city', city ?? undefined)
        add('type', (type as any) ?? undefined)
        add('sharing', (sharing as any) ?? undefined)
        add('minPrice', (minPrice as any) ?? undefined)
        add('maxPrice', (maxPrice as any) ?? undefined)
        add('roomType', roomType ?? undefined)
        add('amenities', amenities ?? undefined)
        add('sort', (sort as any) ?? 'newest')
        qs.set('page', '1')
        router.push(`/properties${qs.toString() ? `?${qs.toString()}` : ''}`)
      } else {
        // Already on /search: update only the query params (page resets to 1 automatically in setParams)
        setParams({
          q,
          city,
          type,
          sharing,
          minPrice,
          maxPrice,
          roomType,
          amenities,
          sort,
          page: 1,
        })
      }
    },
    [reducerState, setParams, dispatch, pathname, router],
  )

  const clearAll = useCallback(() => {
    dispatch({ type: FilterActionTypes.CLEAR_FILTER })
    setValues({
      q: null,
      city: null,
      type: null,
      sharing: null,
      minPrice: null,
      maxPrice: null,
      roomType: null,
      amenities: null,
      sort: 'newest',
      page: 1,
    })
  }, [dispatch, setValues])

  const current: FilterStateContextValue = React.useMemo(
    () => ({
      ...reducerState,
    }),
    [reducerState],
  )

  const actions: FilterActionsContextValue = React.useMemo(
    () => ({
      clearAll,
      setFilters,
      setFilterApplied,
      toggleFilterPanel,
      setParams,
    }),
    [clearAll, setFilters, setFilterApplied, toggleFilterPanel, setParams],
  )

  return (
    <FilterStateContext.Provider value={current}>
      <FilterDispatchContext.Provider value={actions}>{children}</FilterDispatchContext.Provider>
    </FilterStateContext.Provider>
  )
}

// Hooks
export function useFilterState(): FilterStateContextValue {
  const ctx = React.useContext(FilterStateContext)
  if (!ctx) throw new Error('useFilterState must be used within a FilterProvider')
  return ctx
}
export function useFilterActions(): FilterActionsContextValue {
  const ctx = React.useContext(FilterDispatchContext)
  if (!ctx) throw new Error('useFilterActions must be used within a FilterProvider')
  return ctx
}
