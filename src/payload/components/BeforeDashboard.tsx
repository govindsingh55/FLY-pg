'use client'
import React, { useState } from 'react'

const BeforeDashboard: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setMessage('Seeding completed successfully!')
      } else {
        setMessage('Seeding failed: ' + (data.error || 'Unknown error'))
      }
    } catch (err) {
      setMessage('Seeding failed: ' + String(err))
    }
    setLoading(false)
  }

  return (
    <div style={{ margin: '2rem 0', padding: '1rem', background: '#f9f9f9', borderRadius: 8 }}>
      <h2>Seed Test Data</h2>
      <button
        onClick={handleSeed}
        disabled={loading}
        style={{ padding: '0.5rem 1rem', fontSize: '1rem' }}
      >
        {loading ? 'Seeding...' : 'Seed Data'}
      </button>
      {message && (
        <div style={{ marginTop: '1rem', color: message.includes('failed') ? 'red' : 'green' }}>
          {message}
        </div>
      )}
    </div>
  )
}

export default BeforeDashboard
