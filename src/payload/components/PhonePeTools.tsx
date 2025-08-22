import * as React from 'react'

function usePaymentIdFromPath() {
  const [id, setId] = React.useState<string>('')
  React.useEffect(() => {
    try {
      const m = window.location.pathname.match(/\/admin\/collections\/payments\/(.+)$/)
      if (m && m[1]) setId(m[1])
    } catch {}
  }, [])
  return id
}

export default function PhonePeTools() {
  const paymentId = usePaymentIdFromPath()
  const [msg, setMsg] = React.useState<string>('')
  const [loading, setLoading] = React.useState(false)

  async function recheck() {
    if (!paymentId) return
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch(
        `/api/custom/payments/phonepe/status?paymentId=${encodeURIComponent(paymentId)}`,
        { method: 'GET' },
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Failed: ${res.status}`)
      setMsg(`State: ${data.state || 'unknown'}`)
    } catch (e: any) {
      setMsg(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  function openStatusJson() {
    if (!paymentId) return
    window.open(
      `/api/custom/payments/phonepe/status?paymentId=${encodeURIComponent(paymentId)}`,
      '_blank',
    )
  }

  async function markCompleted() {
    if (!paymentId) return
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/custom/payments/admin/mark-completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Failed: ${res.status}`)
      setMsg('Marked completed')
    } catch (e: any) {
      setMsg(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  async function markFailed() {
    if (!paymentId) return
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('/api/custom/payments/admin/mark-failed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Failed: ${res.status}`)
      setMsg('Marked failed')
    } catch (e: any) {
      setMsg(e?.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <button type="button" onClick={recheck} disabled={loading}>
        {loading ? 'Checking…' : 'Recheck Status'}
      </button>
      <button type="button" onClick={openStatusJson} disabled={loading}>
        Open Status JSON
      </button>
      <button type="button" onClick={markCompleted} disabled={loading}>
        Mark Completed
      </button>
      <button type="button" onClick={markFailed} disabled={loading}>
        Mark Failed
      </button>
      {msg ? <span style={{ color: '#666' }}>{msg}</span> : null}
    </div>
  )
}
