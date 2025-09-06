import type { RentDueReminderData, EmailTemplate } from './types'

/**
 * Monthly Rent Due Reminder Email Template
 * Sent to customers before their rent payment is due
 */
export function generateRentDueReminderEmail(data: RentDueReminderData): EmailTemplate {
  const { customerName, paymentAmount, dueDate, daysRemaining, bookingDetails } = data

  const subject = `Rent Payment Reminder - Due ${dueDate.toLocaleDateString()}`

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Rent Payment Reminder</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e9ecef;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #007bff;
          margin-bottom: 10px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .payment-card {
          background: #f8f9fa;
          border-left: 4px solid #007bff;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .payment-details {
          display: grid;
          gap: 10px;
        }
        .payment-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .payment-item:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
          color: #007bff;
        }
        .days-remaining {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 4px;
          text-align: center;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: #007bff;
          color: white;
          padding: 12px 24px;
          text-decoration: none;
          border-radius: 4px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 14px;
          color: #6c757d;
          text-align: center;
        }
        .booking-details {
          background: #e7f3ff;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FLY PG</div>
          <h1>Rent Payment Reminder</h1>
        </div>
        
        <div class="greeting">
          Dear ${customerName},
        </div>
        
        <p>This is a friendly reminder that your rent payment is due soon. Please ensure your payment is made on time to avoid any late fees.</p>
        
        <div class="days-remaining">
          <strong>${daysRemaining} day${daysRemaining > 1 ? 's' : ''} remaining</strong> until your payment is due
        </div>
        
        <div class="payment-card">
          <h3>Payment Details</h3>
          <div class="payment-details">
            <div class="payment-item">
              <span>Amount:</span>
              <span>₹${paymentAmount.toLocaleString()}</span>
            </div>
            <div class="payment-item">
              <span>Due Date:</span>
              <span>${dueDate.toLocaleDateString()}</span>
            </div>
            <div class="payment-item">
              <span>Payment Type:</span>
              <span>Monthly Rent</span>
            </div>
            ${
              bookingDetails
                ? `
            <div class="payment-item">
              <span>Property:</span>
              <span>${bookingDetails.property}</span>
            </div>
            <div class="payment-item">
              <span>Room:</span>
              <span>${bookingDetails.room}</span>
            </div>
            `
                : ''
            }
          </div>
        </div>
        
        ${
          bookingDetails
            ? `
        <div class="booking-details">
          <h4>Booking Information</h4>
          <p><strong>Period:</strong> ${bookingDetails.startDate.toLocaleDateString()} - ${bookingDetails.endDate.toLocaleDateString()}</p>
        </div>
        `
            : ''
        }
        
        <div style="text-align: center;">
          <a href="#" class="cta-button">Make Payment Now</a>
        </div>
        
        <p>If you have any questions or need assistance with your payment, please don't hesitate to contact our support team.</p>
        
        <div class="footer">
          <p>Best regards,<br><strong>FLY PG Team</strong></p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Rent Payment Reminder - FLY PG
    
    Dear ${customerName},
    
    This is a friendly reminder that your rent payment is due soon.
    
    PAYMENT DETAILS:
    - Amount: ₹${paymentAmount.toLocaleString()}
    - Due Date: ${dueDate.toLocaleDateString()}
    - Payment Type: Monthly Rent
    - Days Remaining: ${daysRemaining} day${daysRemaining > 1 ? 's' : ''}
    ${
      bookingDetails
        ? `
    - Property: ${bookingDetails.property}
    - Room: ${bookingDetails.room}
    - Period: ${bookingDetails.startDate.toLocaleDateString()} - ${bookingDetails.endDate.toLocaleDateString()}
    `
        : ''
    }
    
    Please ensure your payment is made on time to avoid any late fees.
    
    If you have any questions or need assistance with your payment, please contact our support team.
    
    Best regards,
    FLY PG Team
    
    This is an automated message. Please do not reply to this email.
  `

  return { subject, html, text }
}
