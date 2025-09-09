'use client'
import React, { useState, useCallback } from 'react'
import { Button, Pill } from '@payloadcms/ui'
import { toast } from 'sonner'

interface CollectionOption {
  id: string
  name: string
  description: string
  dependencies?: string[]
  isBase?: boolean
}

const COLLECTIONS: CollectionOption[] = [
  {
    id: 'users',
    name: 'Users',
    description: 'Admin users and managers',
    isBase: true,
  },
  {
    id: 'customers',
    name: 'Customers',
    description: 'Customer accounts and profiles',
    isBase: true,
  },
  {
    id: 'foodmenu',
    name: 'Food Menu',
    description: 'Food menu items and categories',
    isBase: true,
  },
  {
    id: 'amenities',
    name: 'Amenities',
    description: 'Property amenities and features',
    isBase: true,
  },
  {
    id: 'rooms',
    name: 'Rooms',
    description: 'Room types and configurations',
    dependencies: ['amenities'],
  },
  {
    id: 'media',
    name: 'Media',
    description: 'Images and media files',
    isBase: true,
  },
  {
    id: 'properties',
    name: 'Properties',
    description: 'Property listings and details',
    dependencies: ['foodmenu', 'rooms', 'users', 'amenities'],
  },
  {
    id: 'bookings',
    name: 'Bookings',
    description: 'Room bookings and reservations',
    dependencies: ['properties', 'customers', 'rooms'],
  },
  {
    id: 'visitbookings',
    name: 'Visit Bookings',
    description: 'Property visit appointments',
    dependencies: ['properties', 'customers'],
  },
  {
    id: 'supporttickets',
    name: 'Support Tickets',
    description: 'Customer support tickets',
    dependencies: ['customers'],
  },
  {
    id: 'supportmedia',
    name: 'Support Media',
    description: 'Support-related media files',
    isBase: true,
  },
]

export const SeedSelector: React.FC = () => {
  const [selectedCollections, setSelectedCollections] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [seeded, setSeeded] = useState(false)
  const [error, setError] = useState<null | string>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCollectionToggle = useCallback((collectionId: string) => {
    setSelectedCollections((prev) => {
      if (prev.includes(collectionId)) {
        // Remove collection and its dependents
        const newSelection = prev.filter((id) => id !== collectionId)
        // Remove any collections that depend on this one
        const dependents = COLLECTIONS.filter((c) => c.dependencies?.includes(collectionId))
        dependents.forEach((dep) => {
          const index = newSelection.indexOf(dep.id)
          if (index > -1) {
            newSelection.splice(index, 1)
          }
        })
        return newSelection
      } else {
        // Add collection and its dependencies
        const newSelection = [...prev, collectionId]
        const collection = COLLECTIONS.find((c) => c.id === collectionId)
        if (collection?.dependencies) {
          collection.dependencies.forEach((depId) => {
            if (!newSelection.includes(depId)) {
              newSelection.push(depId)
            }
          })
        }
        return newSelection
      }
    })
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedCollections(COLLECTIONS.map((c) => c.id))
  }, [])

  const handleDeselectAll = useCallback(() => {
    setSelectedCollections([])
  }, [])

  const handleReset = useCallback(() => {
    setSeeded(false)
    setError(null)
    setSelectedCollections([])
  }, [])

  const handleSeed = useCallback(async () => {
    if (selectedCollections.length === 0) {
      toast.error('Please select at least one collection to seed.')
      return
    }

    if (seeded) {
      toast.info('Database already seeded.')
      return
    }
    if (loading) {
      toast.info('Seeding already in progress.')
      return
    }
    if (error) {
      toast.error(`An error occurred, please refresh and try again.`)
      return
    }

    setLoading(true)
    setError(null)
    setIsExpanded(false) // Close accordion when seeding starts

    try {
      console.log('Sending seed request with collections:', selectedCollections)
      const res = await fetch('/api/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ collections: selectedCollections }),
      })

      console.log('Seed response status:', res.status)
      const data = await res.json().catch(() => ({}))
      console.log('Seed response data:', data)

      if (res.ok && data.success) {
        // Reset selection and show success
        setSelectedCollections([])
        setSeeded(true)
        toast.success(`Successfully seeded ${selectedCollections.length} collection(s)!`)
      } else {
        throw new Error('An error occurred while seeding. ' + (data.error || ''))
      }
    } catch (error) {
      console.error('Seed request error:', error)
      setError(String(error))
      toast.error('An error occurred while seeding.')
    } finally {
      setLoading(false)
    }
  }, [selectedCollections, seeded, loading, error])

  const getCollectionStatus = (collection: CollectionOption) => {
    if (selectedCollections.includes(collection.id)) {
      return 'selected'
    }
    if (collection.dependencies?.some((dep) => !selectedCollections.includes(dep))) {
      return 'disabled'
    }
    return 'available'
  }

  return (
    <div
      style={{
        padding: '1rem 0',
        borderBottom: '1px solid var(--theme-elevation-200)',
        marginBottom: '1rem',
      }}
    >
      {/* Accordion Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: isExpanded ? '1rem' : '0',
          cursor: 'pointer',
          padding: '0.5rem',
          borderRadius: '6px',
          backgroundColor: isExpanded ? 'var(--theme-elevation-50)' : 'transparent',
          transition: 'background-color 0.2s ease',
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--theme-elevation-800)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <span
              style={{
                transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s ease',
                fontSize: '0.8rem',
              }}
            >
              ▶
            </span>
            Seed Test Data
            {seeded ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--theme-success-600)',
                  backgroundColor: 'var(--theme-success-100)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px',
                  fontWeight: '500',
                }}
              >
                ✓ Seeded
              </span>
            ) : selectedCollections.length > 0 ? (
              <span
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--theme-elevation-600)',
                  backgroundColor: 'var(--theme-elevation-100)',
                  padding: '0.1rem 0.4rem',
                  borderRadius: '10px',
                  fontWeight: '500',
                }}
              >
                {selectedCollections.length} selected
              </span>
            ) : null}
          </h3>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.85rem',
              color: 'var(--theme-elevation-600)',
            }}
          >
            {seeded
              ? 'Database has been seeded successfully. Click to reseed or reset.'
              : isExpanded
                ? 'Select collections to populate with sample data'
                : 'Click to expand and select collections for seeding'}
          </p>
        </div>

        {isExpanded && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}
            onClick={(e) => e.stopPropagation()}
          >
            {!seeded && !loading && (
              <>
                <Button
                  onClick={handleSelectAll}
                  disabled={loading}
                  buttonStyle="secondary"
                  size="small"
                >
                  Select All
                </Button>
                <Button
                  onClick={handleDeselectAll}
                  disabled={loading}
                  buttonStyle="secondary"
                  size="small"
                >
                  Deselect All
                </Button>
              </>
            )}
            <Button
              onClick={seeded ? handleReset : handleSeed}
              disabled={loading || (!seeded && selectedCollections.length === 0)}
              buttonStyle={seeded ? 'secondary' : 'primary'}
              size="small"
              icon={loading ? 'loading' : seeded ? 'refresh' : 'plus'}
            >
              {loading
                ? 'Seeding...'
                : seeded
                  ? 'Reset & Reseed'
                  : `Seed (${selectedCollections.length})`}
            </Button>
          </div>
        )}
      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div
          style={{
            animation: 'fadeIn 0.3s ease-in-out',
            marginBottom: '1rem',
          }}
        >
          {!seeded && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {COLLECTIONS.map((collection) => {
                const status = getCollectionStatus(collection)
                const isSelected = selectedCollections.includes(collection.id)
                const isDisabled = status === 'disabled' || loading

                return (
                  <div
                    key={collection.id}
                    style={{
                      padding: '0.75rem',
                      border: `1px solid ${
                        isSelected
                          ? 'var(--theme-success-300)'
                          : isDisabled
                            ? 'var(--theme-elevation-200)'
                            : 'var(--theme-elevation-300)'
                      }`,
                      borderRadius: '6px',
                      backgroundColor: isSelected
                        ? 'var(--theme-success-50)'
                        : isDisabled
                          ? 'var(--theme-elevation-50)'
                          : 'var(--theme-elevation-0)',
                      opacity: isDisabled ? 0.6 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onClick={() => !isDisabled && handleCollectionToggle(collection.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={isDisabled}
                        readOnly
                        style={{
                          marginTop: '0.125rem',
                          cursor: isDisabled ? 'not-allowed' : 'pointer',
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div
                          style={{
                            fontWeight: '500',
                            fontSize: '0.9rem',
                            color: 'var(--theme-elevation-800)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {collection.name}
                          {collection.isBase && (
                            <span
                              style={{
                                marginLeft: '0.5rem',
                                fontSize: '0.7rem',
                                color: 'var(--theme-success-600)',
                                backgroundColor: 'var(--theme-success-100)',
                                padding: '0.1rem 0.3rem',
                                borderRadius: '3px',
                              }}
                            >
                              BASE
                            </span>
                          )}
                        </div>
                        <div
                          style={{
                            fontSize: '0.8rem',
                            color: 'var(--theme-elevation-600)',
                            marginBottom: '0.25rem',
                          }}
                        >
                          {collection.description}
                        </div>
                        {collection.dependencies && collection.dependencies.length > 0 && (
                          <div
                            style={{
                              fontSize: '0.7rem',
                              color: 'var(--theme-elevation-500)',
                            }}
                          >
                            Depends on: {collection.dependencies.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {seeded && (
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--theme-success-50)',
                border: '1px solid var(--theme-success-200)',
                borderRadius: '6px',
                marginBottom: '1rem',
                textAlign: 'center',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: 'var(--theme-success-700)',
                  marginBottom: '0.5rem',
                }}
              >
                ✓ Database Seeded Successfully!
              </div>
              <div
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--theme-success-600)',
                }}
              >
                All selected collections have been populated with test data.
              </div>
            </div>
          )}

          {!seeded && selectedCollections.length > 0 && (
            <div style={{ marginBottom: '1rem' }} onClick={(e) => e.stopPropagation()}>
              <Pill pillStyle="success" className="pill--has-icon">
                ✓ Selected: {selectedCollections.join(', ')}
              </Pill>
            </div>
          )}

          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'var(--theme-warning-50)',
              border: '1px solid var(--theme-warning-200)',
              borderRadius: '4px',
              fontSize: '0.8rem',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <strong style={{ color: 'var(--theme-warning-700)' }}>⚠ Warning:</strong>
            <span style={{ color: 'var(--theme-warning-700)', marginLeft: '0.5rem' }}>
              This will delete existing data in selected collections and replace it with test data.
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default SeedSelector
