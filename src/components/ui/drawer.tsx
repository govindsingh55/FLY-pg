'use client'

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from '@headlessui/react'
import { X } from 'lucide-react'
import { parseAsBoolean, parseAsString, useQueryState, useQueryStates } from 'nuqs'
import * as RadixSlider from '@radix-ui/react-slider'
import { useReducer, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

type FilterState = {
  city: string
  propertyType: string
  priceRange: string
  sharingType: string
}

type Action =
  | { type: 'set'; payload: Partial<FilterState> }
  | { type: 'reset'; payload: FilterState }

export default function Drawer() {
  const [open, setOpen] = useQueryState('searchDrawerOpen', parseAsBoolean.withDefault(false))
  const [filterState, setFilterState] = useQueryStates(
    {
      city: parseAsString.withDefault(''),
      propertyType: parseAsString.withDefault(''),
      priceRange: parseAsString.withDefault(''),
      sharingType: parseAsString.withDefault(''),
    },
    { shallow: false },
  )
  // Reducer for local form state
  function reducer(state: FilterState, action: Action): FilterState {
    switch (action.type) {
      case 'set':
        return { ...state, ...action.payload }
      case 'reset':
        return { ...action.payload }
      default:
        return state
    }
  }
  const [formState, dispatch] = useReducer(reducer, filterState as FilterState)
  // Sync local state with query state on open
  useEffect(() => {
    if (open) {
      dispatch({ type: 'reset', payload: filterState })
    }
  }, [open])
  const router = useRouter()
  const pathname = usePathname()
  const cities = ['Noida']
  const propertyTypes = ['Pg', 'Hostel', 'Apartment']
  const sharingTypes = ['Single', 'Two sharing', 'Three sharing']
  useEffect(() => {
    if (open && pathname.startsWith('/search')) {
      setOpen(null)
    }
  }, [pathname, open])
  return (
    <Dialog open={Boolean(open)} onClose={() => setOpen(null)} className="fixed inset-0 z-50">
      <DialogBackdrop transition className="fixed inset-0 bg-black/60 data-closed:opacity-0" />
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden">
          <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-0">
            <DialogPanel
              transition
              className="pointer-events-auto relative w-screen max-w-md transform transition duration-500 ease-in-out data-closed:translate-x-full sm:duration-700"
            >
              <TransitionChild>
                <div className="absolute top-0 left-0 -ml-8 flex pt-4 pr-2 data-closed:opacity-0 sm:-ml-10 sm:pr-4">
                  <button
                    type="button"
                    onClick={() => setOpen(null)}
                    className="relative rounded-md text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    <span className="absolute -inset-2.5" />
                    <span className="sr-only">Close panel</span>
                    <X aria-hidden="true" className="size-6" />
                  </button>
                </div>
              </TransitionChild>
              <div className="flex h-full flex-col overflow-y-auto bg-card py-6 shadow-xl border border-border">
                <div className="container px-4 sm:px-6">
                  <DialogTitle className="text-lg font-semibold text-foreground mb-4">
                    Search {pathname}
                  </DialogTitle>
                  <form
                    className="space-y-4"
                    onSubmit={async (e) => {
                      e.preventDefault()
                      const searchParams = await setFilterState(formState)
                      if (!pathname.startsWith('/search')) {
                        router.push('/search?' + searchParams.toString())
                        // Do not close drawer here; let useEffect handle it
                      } else {
                        setOpen(null)
                      }
                    }}
                  >
                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        City
                      </label>
                      <select
                        id="city"
                        value={formState.city}
                        onChange={(e) =>
                          dispatch({ type: 'set', payload: { city: e.target.value } })
                        }
                        className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">-- Select City --</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="propertyType"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        Property Type
                      </label>
                      <select
                        id="propertyType"
                        value={formState.propertyType}
                        onChange={(e) =>
                          dispatch({ type: 'set', payload: { propertyType: e.target.value } })
                        }
                        className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">-- Select Property Type --</option>
                        {propertyTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="sharingType"
                        className="block text-sm font-medium text-foreground mb-1"
                      >
                        Sharing Type
                      </label>
                      <select
                        id="sharingType"
                        value={formState.sharingType}
                        onChange={(e) =>
                          dispatch({ type: 'set', payload: { sharingType: e.target.value } })
                        }
                        className="w-full rounded border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        <option value="">-- Select Sharing Type --</option>
                        {sharingTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">
                        Price Range
                      </label>
                      <div className="flex gap-2 items-center mb-2">
                        <input
                          type="number"
                          min={0}
                          max={100000}
                          id="priceMin"
                          value={formState.priceRange.split('-')[0] || ''}
                          onChange={(e) => {
                            const max = formState.priceRange.split('-')[1] || ''
                            dispatch({
                              type: 'set',
                              payload: { priceRange: `${e.target.value}-${max}` },
                            })
                          }}
                          placeholder="Min"
                          className="w-1/2 rounded border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                        <span className="text-muted-foreground">-</span>
                        <input
                          type="number"
                          min={0}
                          max={100000}
                          id="priceMax"
                          value={formState.priceRange.split('-')[1] || ''}
                          onChange={(e) => {
                            const min = formState.priceRange.split('-')[0] || ''
                            dispatch({
                              type: 'set',
                              payload: { priceRange: `${min}-${e.target.value}` },
                            })
                          }}
                          placeholder="Max"
                          className="w-1/2 rounded border border-border bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        />
                      </div>
                      <RadixSlider.Root
                        className="relative flex w-full touch-none select-none items-center h-5 px-2"
                        min={0}
                        max={100000}
                        step={1000}
                        value={[
                          Number(formState.priceRange.split('-')[0]) || 0,
                          Number(formState.priceRange.split('-')[1]) || 0,
                        ]}
                        onValueChange={([min, max]) => {
                          dispatch({ type: 'set', payload: { priceRange: `${min}-${max}` } })
                        }}
                      >
                        <RadixSlider.Track className="bg-border relative grow rounded-full h-2">
                          <RadixSlider.Range className="absolute bg-primary rounded-full h-2 shadow" />
                        </RadixSlider.Track>
                        <RadixSlider.Thumb className="block w-4 h-4 bg-primary rounded-full border border-card shadow focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150" />
                        <RadixSlider.Thumb className="block w-4 h-4 bg-primary rounded-full border border-card shadow focus:outline-none focus:ring-2 focus:ring-primary transition-colors duration-150" />
                      </RadixSlider.Root>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Use the slider or inputs to set a price range (min-max).
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        type="submit"
                        className="bg-primary text-primary-foreground px-4 py-2 rounded shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Search
                      </button>
                      <button
                        type="button"
                        className="bg-muted text-muted-foreground px-4 py-2 rounded shadow hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => setOpen(null)}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </DialogPanel>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
