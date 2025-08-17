export function renderVisitBookingEmail(
  booking: any,
  property: any,
  opts: { siteUrl?: string } = {},
) {
  const siteUrl = opts.siteUrl || 'http://localhost:3000'
  const bookingId = booking?.id || booking?._id || ''
  const propertyName = property?.name || property?.title || `Property ${booking?.property || ''}`
  const visitDate = booking?.visitDate ? new Date(booking.visitDate).toLocaleString() : 'TBD'
  const guestName =
    booking?.guestUser?.guestName ||
    booking?.guestUser?.name ||
    booking?.guestUser?.guest_name ||
    ''
  const phone = booking?.guestUser?.phone || ''
  const notes = booking?.notes || ''

  const text = `Your visit booking is confirmed.

Booking ID: ${bookingId}
Property: ${propertyName}
Visit Date: ${visitDate}
Guest: ${guestName}
Phone: ${phone}
Notes: ${notes}

If you need to make changes or cancel, reply to this email or visit: ${siteUrl}

Thank you,
${process.env.RESEND_FROM_NAME || 'FLY PG'}`

  const html = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; color: #111; line-height:1.4;">
    <h2 style="margin-bottom:0.25rem">Visit booking confirmed</h2>
    <p style="color:#444; margin-top:0">Booking ID: <strong>${bookingId}</strong></p>
    <table style="width:100%; border-collapse:collapse; margin-top:12px">
      <tr><td style="padding:6px 0; width:30%"><strong>Property</strong></td><td style="padding:6px 0">${propertyName}</td></tr>
      <tr><td style="padding:6px 0"><strong>Visit Date</strong></td><td style="padding:6px 0">${visitDate}</td></tr>
      <tr><td style="padding:6px 0"><strong>Guest</strong></td><td style="padding:6px 0">${guestName}</td></tr>
      <tr><td style="padding:6px 0"><strong>Phone</strong></td><td style="padding:6px 0">${phone}</td></tr>
      <tr><td style="padding:6px 0"><strong>Notes</strong></td><td style="padding:6px 0">${notes}</td></tr>
    </table>
    <p style="margin-top:16px">If you need to change or cancel, reply to this email or visit <a href="${siteUrl}">${siteUrl}</a>.</p>
    <p>Thanks,<br/>${process.env.RESEND_FROM_NAME || 'FLY PG'}</p>
  </div>
  `

  return { html, text }
}
