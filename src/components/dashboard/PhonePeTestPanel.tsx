'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface PhonePeTestPanelProps {
  paymentId?: string
  bookingId?: string
}

export default function PhonePeTestPanel({ paymentId, bookingId }: PhonePeTestPanelProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [customPaymentId, setCustomPaymentId] = useState(paymentId || '')

  const apiBase = process.env.NEXT_PUBLIC_SITE_URL || ''

  async function checkPaymentStatus() {
    const pid = customPaymentId || paymentId
    if (!pid) {
      toast.error('Please enter a payment ID')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `${apiBase}/api/custom/customers/payments/${encodeURIComponent(pid)}/status`,
      )
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || `Failed: ${res.status}`)
      }

      setStatus(data)
      toast.success(`Status: ${data.state || 'unknown'}`)
    } catch (err: any) {
      toast.error(err?.message || 'Failed to check status')
    } finally {
      setLoading(false)
    }
  }

  async function markCompleted() {
    const pid = customPaymentId || paymentId
    if (!pid) {
      toast.error('Please enter a payment ID')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `${apiBase}/api/custom/customers/payments/${encodeURIComponent(pid)}/admin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark-completed' }),
        },
      )
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || `Failed: ${res.status}`)
      }

      toast.success('Payment marked as completed')
      setStatus({ ...status, state: 'PAYMENT_SUCCESS' })
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mark completed')
    } finally {
      setLoading(false)
    }
  }

  async function markFailed() {
    const pid = customPaymentId || paymentId
    if (!pid) {
      toast.error('Please enter a payment ID')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `${apiBase}/api/custom/customers/payments/${encodeURIComponent(pid)}/admin`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark-failed' }),
        },
      )
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.error || `Failed: ${res.status}`)
      }

      toast.success('Payment marked as failed')
      setStatus({ ...status, state: 'PAYMENT_ERROR' })
    } catch (err: any) {
      toast.error(err?.message || 'Failed to mark failed')
    } finally {
      setLoading(false)
    }
  }

  async function simulatePhonePeCallback() {
    const pid = customPaymentId || paymentId
    if (!pid) {
      toast.error('Please enter a payment ID')
      return
    }

    setLoading(true)
    try {
      // Simulate a successful PhonePe callback
      const mockCallbackData = {
        merchantId: process.env.NEXT_PUBLIC_PHONEPE_MERCHANT_ID || 'PGTESTPAYUAT',
        merchantTransactionId: `BOOK-${pid}`,
        transactionId: `TXN_${Date.now()}`,
        amount: 100000, // 1000 INR in paise
        state: 'PAYMENT_SUCCESS',
        responseCode: 'SUCCESS',
        paymentInstrument: {
          type: 'UPI',
          utr: `UTR${Date.now()}`,
        },
      }

      const res = await fetch(`${apiBase}/api/custom/customers/payments/phonepe/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': 'mock-signature-for-testing',
        },
        body: JSON.stringify(mockCallbackData),
      })

      if (!res.ok) {
        throw new Error(`Callback failed: ${res.status}`)
      }

      toast.success('PhonePe callback simulated successfully')
      setStatus({ ...status, state: 'PAYMENT_SUCCESS' })
    } catch (err: any) {
      toast.error(err?.message || 'Failed to simulate callback')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>PhonePe Testing Panel</CardTitle>
        <CardDescription>Development tools for testing PhonePe payment integration</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="paymentId">Payment ID</Label>
          <Input
            id="paymentId"
            value={customPaymentId}
            onChange={(e) => setCustomPaymentId(e.target.value)}
            placeholder="Enter payment ID to test"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button onClick={checkPaymentStatus} disabled={loading} variant="outline">
            {loading ? 'Checking...' : 'Check Status'}
          </Button>

          <Button onClick={simulatePhonePeCallback} disabled={loading} variant="outline">
            {loading ? 'Simulating...' : 'Simulate Callback'}
          </Button>

          <Button
            onClick={markCompleted}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Marking...' : 'Mark Completed'}
          </Button>

          <Button onClick={markFailed} disabled={loading} className="bg-red-600 hover:bg-red-700">
            {loading ? 'Marking...' : 'Mark Failed'}
          </Button>
        </div>

        {status && (
          <div className="mt-4 p-3 bg-gray-50 rounded-md">
            <h4 className="font-medium mb-2">Last Status Response:</h4>
            <pre className="text-xs overflow-auto">{JSON.stringify(status, null, 2)}</pre>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>
            <strong>Note:</strong> This panel is for development/testing only.
          </p>
          <p>Use the PhonePe UAT environment credentials for testing.</p>
        </div>
      </CardContent>
    </Card>
  )
}
