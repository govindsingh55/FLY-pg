/*
  Script: create-sample-payments.js
  Purpose: Create three sample payments in the local Payload instance to verify admin UI conditional fields.

  Requirements:
  - Node 18+ (for global fetch) or run with node that supports fetch, otherwise install node-fetch and adapt.
  - Environment variables:
      PAYLOAD_URL (default: http://localhost:3000)
      PAYLOAD_ADMIN_TOKEN (required) - an Admin/API token for your Payload instance (use admin token or generate one)

  Usage (PowerShell):
    $env:PAYLOAD_ADMIN_TOKEN = "your_admin_token";
    node .\scripts\create-sample-payments.js

  The script will:
  1. Find one existing customer and one existing booking (used for relationships).
  2. Create three payments: cash (walk-in), UPI, credit-card.
  3. Print the created payment IDs and server responses.

  Notes:
  - If there are no customers or bookings, the script will stop and instruct you to create them first.
  - The script uses the REST endpoints at /api/customers, /api/bookings, /api/payments.
*/

import https from 'https'

const PAYLOAD_URL = process.env.PAYLOAD_URL || 'http://localhost:3000'
const ADMIN_TOKEN = process.env.PAYLOAD_ADMIN_TOKEN

if (!ADMIN_TOKEN) {
  console.error('ERROR: PAYLOAD_ADMIN_TOKEN environment variable is required')
  process.exit(1)
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${ADMIN_TOKEN}`,
}

async function api(path, opts = {}) {
  const url = `${PAYLOAD_URL.replace(/\/$/, '')}/api/${path.replace(/^\//, '')}`
  const fetchOpts = {
    method: opts.method || 'GET',
    headers: { ...headers, ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    // allow self-signed certs in dev environments (if needed)
    agent: new https.Agent({ rejectUnauthorized: false }),
  }

  const res = await fetch(url, fetchOpts)
  const text = await res.text()
  let json
  try {
    json = JSON.parse(text)
  } catch {
    json = { raw: text }
  }
  if (!res.ok) {
    throw new Error(
      `API ${fetchOpts.method} ${url} failed: ${res.status} ${res.statusText} - ${JSON.stringify(json)}`,
    )
  }
  return json
}

function isoDateOnly(d) {
  // Return YYYY-MM-DD (Payload date fields accept ISO strings)
  return new Date(d).toISOString()
}

async function main() {
  console.log('Looking for an existing customer...')
  const customers = await api('customers?limit=1')
  if (!customers?.docs || customers.docs.length === 0) {
    console.error(
      'No customers found. Please create at least one customer in the admin UI before running this script.',
    )
    process.exit(1)
  }
  const customer = customers.docs[0]
  console.log('Using customer:', customer.id)

  console.log('Looking for an existing booking...')
  const bookings = await api('bookings?limit=1')
  if (!bookings?.docs || bookings.docs.length === 0) {
    console.error(
      'No bookings found. Please create at least one booking in the admin UI before running this script.',
    )
    process.exit(1)
  }
  const booking = bookings.docs[0]
  console.log('Using booking:', booking.id)

  const now = new Date()
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const dueDate = new Date(now)
  dueDate.setDate(now.getDate() + 10)

  const paymentsToCreate = [
    {
      // Cash / Walk-in
      status: 'completed',
      amount: 5000,
      customer: customer.id,
      payfor: booking.id,
      paymentForMonthAndYear: isoDateOnly(firstOfMonth),
      dueDate: isoDateOnly(dueDate),
      paymentDate: isoDateOnly(now),
      paymentMethod: 'cash',
      paymentSource: 'walk-in',
      notes: 'Sample cash payment (walk-in) created by script',
    },
    {
      // UPI
      status: 'completed',
      amount: 4500,
      customer: customer.id,
      payfor: booking.id,
      paymentForMonthAndYear: isoDateOnly(firstOfMonth),
      dueDate: isoDateOnly(dueDate),
      paymentDate: isoDateOnly(now),
      paymentMethod: 'upi',
      paymentSource: 'mobile-app',
      paymentMethodDetails: { upiId: 'test@upi' },
      gateway: 'phonepe',
      notes: 'Sample UPI payment created by script',
    },
    {
      // Credit Card
      status: 'completed',
      amount: 5200,
      customer: customer.id,
      payfor: booking.id,
      paymentForMonthAndYear: isoDateOnly(firstOfMonth),
      dueDate: isoDateOnly(dueDate),
      paymentDate: isoDateOnly(now),
      paymentMethod: 'credit-card',
      paymentSource: 'web-dashboard',
      paymentMethodDetails: { cardLast4: '4242', cardType: 'Visa' },
      gateway: 'phonepe',
      notes: 'Sample card payment created by script',
    },
  ]

  for (const p of paymentsToCreate) {
    try {
      console.log('\nCreating payment:', p.paymentMethod, p.amount)
      const created = await api('payments', { method: 'POST', body: p })
      console.log('Created payment:', created?.doc?.id ?? created?.id ?? created)
      console.log('Full response:', JSON.stringify(created, null, 2))
    } catch (err) {
      console.error('Failed to create payment:', err.message || err)
    }
  }

  console.log(
    '\nDone. Open the admin UI and verify the created payments in the Payments collection.',
  )
}

main().catch((err) => {
  console.error('Script error:', err)
  process.exit(1)
})
