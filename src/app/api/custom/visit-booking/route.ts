import { renderVisitBookingEmail } from '@/lib/email/visitBookingEmail'
import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function POST(req: NextRequest) {
  try {
    const payload = await getPayload({ config })
    const body = await req.json()
    // Validate required fields
    if (!body.property || !body.visitDate) {
      return NextResponse.json({ error: 'Missing property or visitDate' }, { status: 400 })
    }
    // If guestUser, validate guest fields
    if (!body.customer && body.guestUser) {
      const { guestName, email, phone } = body.guestUser
      if (!guestName || !email || !phone) {
        return NextResponse.json({ error: 'Missing guest details' }, { status: 400 })
      }
    }

    if (body.customer && !body.guestUser) {
      const customerData = await payload.find({
        collection: 'customers',
        where: {
          id: body.customer,
        },
      })
      if (!customerData) {
        return NextResponse.json({ error: 'Invalid customer ID' }, { status: 400 })
      }
    }

    // Create booking using Payload local API
    const booking: any = await payload.create({
      collection: 'visit-bookings',
      data: {
        property: body.property,
        visitDate: body.visitDate,
        notes: body.notes,
        customer: body.customer,
        guestUser: body.guestUser,
      },
    })
    console.log('Created visit booking:', booking)
    // Resolve recipient: prefer guest email, fall back to customer email
    try {
      let recipient: string | null = null
      if (booking?.guestUser && typeof booking.guestUser === 'object') {
        recipient = booking.guestUser?.email || null
      }

      if (!recipient && booking?.customer) {
        const customerData: any = await payload.find({
          collection: 'customers',
          where: { id: booking.customer },
          depth: 0,
        })
        if (customerData?.docs && customerData.docs.length) {
          recipient = customerData.docs[0].email || null
        }
      }
      console.log('Sending visit booking email to 1:', recipient)

      if (recipient) {
        // Optionally fetch property details for nicer email content
        let property: any = null
        try {
          const propRes: any = await payload.find({
            collection: 'properties',
            where: { id: booking.property },
            depth: 0,
          })
          property = propRes?.docs?.[0] || null
        } catch (e) {
          property = null
        }

        const { html, text } = renderVisitBookingEmail(booking, property, {
          siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        })

        // Build email payload for logging and send
        const emailPayload = {
          to: recipient,
          subject: `Visit booking confirmed${property?.name ? ' — ' + property.name : ''}`,
          from: {
            name: process.env.RESEND_FROM_NAME || 'FLY PG',
            email: process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev',
          },
          // include small previews rather than full bodies in logs
          htmlPreview: typeof html === 'string' ? html.slice(0, 1000) : undefined,
          textPreview: typeof text === 'string' ? text.slice(0, 1000) : undefined,
        }

        // Log via Payload logger when available, and fallback to console
        try {
          payload.logger?.info?.('Preparing visit booking email', {
            bookingId: booking.id || booking._id,
            recipient,
            property: property?.id || property?._id,
            preview: { htmlLen: (html || '').length, textLen: (text || '').length },
          })
        } catch {
          // ignore
        }
        console.log('Visit booking email payload preview:', emailPayload)

        // Send and log result so we can confirm delivery and inspect adapter response
        try {
          // Resend adapter expects a `from` in email format ("Name <email@example.com>" or "email@example.com").
          const fromValue = emailPayload.from?.name
            ? `${emailPayload.from.name} <${emailPayload.from.email}>`
            : emailPayload.from?.email || process.env.RESEND_FROM_ADDRESS || 'onboarding@resend.dev'
          console.log('Email from value used:', fromValue)

          const sendResult = await payload.sendEmail({
            to: recipient,
            subject: emailPayload.subject,
            html,
            text,
            from: fromValue,
          })

          try {
            payload.logger?.info?.('Visit booking confirmation email sent', {
              bookingId: booking.id || booking._id,
              recipient,
              sendResult,
            })
          } catch {
            // ignore
          }
          console.log('Visit booking confirmation sendResult:', sendResult)
        } catch (err: any) {
          // Build detailed error info safely
          const errorInfo: any = {
            message: err?.message || String(err),
            name: err?.name,
            status: err?.status || err?.statusCode || err?.code,
            stack: err?.stack,
          }

          try {
            if (err?.response) {
              const resp = err.response
              errorInfo.response = {
                status: resp.status || resp.statusCode,
                body: typeof resp.body === 'string' ? resp.body.slice(0, 2000) : resp.body,
              }
            } else if (err?.errors) {
              errorInfo.errors = err.errors
            }
          } catch (extractErr) {
            // ignore extraction errors
          }

          // Log via Payload logger and console for local debugging
          try {
            payload.logger?.error?.('Visit booking confirmation email failed', {
              bookingId: booking.id || booking._id,
              recipient,
              emailPreview: { htmlLen: (html || '').length, textLen: (text || '').length },
              error: errorInfo,
            })
          } catch (logErr) {
            console.error('Visit booking confirmation email failed (logger error)', {
              bookingId: booking.id || booking._id,
              recipient,
              errorInfo,
              logErr,
            })
          }

          try {
            console.error('Visit booking confirmation email failed', {
              bookingId: booking.id || booking._id,
              recipient,
              errorInfo,
            })
          } catch {
            console.error('Visit booking confirmation email failed (unable to stringify error)')
          }
        }
      }
    } catch (err) {
      // keep email failures from blocking the API response
      try {
        payload.logger?.error?.('Error resolving recipient for visit booking email', err)
      } catch {
        console.error('Error resolving recipient for visit booking email', err)
      }
    }

    return NextResponse.json({ success: true, booking })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 })
  }
}
