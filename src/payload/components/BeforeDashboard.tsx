'use client'
import React, { useState } from 'react'
import { Button, Pill, useConfig } from '@payloadcms/ui'

const BeforeDashboard: React.FC = () => {
  const config = useConfig()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setMessage(null)
    setMessageType(null)

    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setMessage('Database seeded successfully!')
        setMessageType('success')
      } else {
        setMessage('Seeding failed: ' + (data.error || 'Unknown error'))
        setMessageType('error')
      }
    } catch (err) {
      setMessage('Seeding failed: ' + String(err))
      setMessageType('error')
    }

    setLoading(false)
  }

  const navigateToJobSystem = () => {
    // Navigate to the existing job monitoring page
    window.location.href = '/admin/jobs'
  }

  return (
    <div
      style={{
        padding: '1rem 0',
        borderBottom: '1px solid var(--theme-elevation-200)',
        marginBottom: '1rem',
      }}
    >
      {/* Job System Navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '1rem',
        }}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--theme-elevation-800)',
            }}
          >
            Payment System Jobs
          </h3>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.85rem',
              color: 'var(--theme-elevation-600)',
            }}
          >
            Monitor and manage payment processing jobs, schedules, and analytics
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            onClick={navigateToJobSystem}
            buttonStyle="secondary"
            size="small"
            icon="settings"
          >
            Open Job Dashboard
          </Button>
        </div>
      </div>

      {/* Seed Database Section */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1, minWidth: '200px' }}>
          <h3
            style={{
              margin: 0,
              fontSize: '1.1rem',
              fontWeight: '600',
              color: 'var(--theme-elevation-800)',
            }}
          >
            Seed Test Data
          </h3>
          <p
            style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.85rem',
              color: 'var(--theme-elevation-600)',
            }}
          >
            Populate database with sample data for testing
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Button
            onClick={handleSeed}
            disabled={loading}
            buttonStyle="primary"
            size="small"
            icon={loading ? 'loading' : 'plus'}
          >
            {loading ? 'Seeding...' : 'Seed Database'}
          </Button>
        </div>
      </div>

      {message && (
        <div style={{ marginTop: '0.75rem' }}>
          <Pill
            pillStyle={messageType === 'success' ? 'success' : 'error'}
            className="pill--has-icon"
          >
            {messageType === 'success' ? '✓' : '⚠'} {message}
          </Pill>
        </div>
      )}

      <div
        style={{
          marginTop: '0.75rem',
          padding: '0.5rem 0.75rem',
          backgroundColor: 'var(--theme-warning-50)',
          border: '1px solid var(--theme-warning-200)',
          borderRadius: '4px',
          fontSize: '0.8rem',
        }}
      >
        <strong style={{ color: 'var(--theme-warning-700)' }}>⚠ Warning:</strong>
        <span style={{ color: 'var(--theme-warning-700)', marginLeft: '0.5rem' }}>
          This will delete existing data and replace it with test data.
        </span>
      </div>
    </div>
  )
}

export default BeforeDashboard
