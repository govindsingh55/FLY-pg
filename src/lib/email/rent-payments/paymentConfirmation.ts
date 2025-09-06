import type { PaymentConfirmationData, EmailTemplate } from './types'

/**
 * Payment Confirmation Email Template
 * Sent to customers after successful payment
 */
export function generatePaymentConfirmationEmail(data: PaymentConfirmationData): EmailTemplate {
  const {
    customerName,
    paymentAmount,
    dueDate,
    processedDate,
    paymentMethod,
    transactionId,
    bookingDetails,
  } = data

  const subject = `Payment Confirmation - ₹${paymentAmount.toLocaleString()}`

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Confirmation</title>
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
          color: #28a745;
          margin-bottom: 10px;
        }
        .success-icon {
          font-size: 48px;
          color: #28a745;
          margin-bottom: 15px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .payment-card {
          background: #e8f5e8;
          border-left: 4px solid #28a745;
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
          border-bottom: 1px solid #d4edda;
        }
        .payment-item:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
          color: #28a745;
        }
        .transaction-details {
          background: #f8f9fa;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
        }
        .booking-details {
          background: #e7f3ff;
          padding: 15px;
          border-radius: 4px;
          margin: 15px 0;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          font-size: 14px;
          color: #6c757d;
          text-align: center;
        }
        .next-payment {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FLY PG</div>
          <div class="success-icon">✓</div>
          <h1>Payment Confirmed</h1>
        </div>
        
        <div class="greeting">
          Dear ${customerName},
        </div>
        
        <p>Great news! Your rent payment has been successfully processed. Thank you for your timely payment.</p>
        
        <div class="payment-card">
          <h3>Payment Details</h3>
          <div class="payment-details">
            <div class="payment-item">
              <span>Amount Paid:</span>
              <span>₹${paymentAmount.toLocaleString()}</span>
            </div>
            <div class="payment-item">
              <span>Due Date:</span>
              <span>${dueDate.toLocaleDateString()}</span>
            </div>
            <div class="payment-item">
              <span>Processed Date:</span>
              <span>${processedDate.toLocaleDateString()}</span>
            </div>
            <div class="payment-item">
              <span>Payment Method:</span>
              <span>${paymentMethod}</span>
            </div>
            ${
              transactionId
                ? `
            <div class="payment-item">
              <span>Transaction ID:</span>
              <span>${transactionId}</span>
            </div>
            `
                : ''
            }
          </div>
        </div>
        
        ${
          transactionId
            ? `
        <div class="transaction-details">
          <h4>Transaction Information</h4>
          <p><strong>Transaction ID:</strong> ${transactionId}</p>
          <p><strong>Status:</strong> Completed</p>
          <p><strong>Processed:</strong> ${processedDate.toLocaleString()}</p>
        </div>
        `
            : ''
        }
        
        ${
          bookingDetails
            ? `
        <div class="booking-details">
          <h4>Booking Information</h4>
          <p><strong>Property:</strong> ${bookingDetails.property}</p>
          <p><strong>Room:</strong> ${bookingDetails.room}</p>
          <p><strong>Period:</strong> ${bookingDetails.startDate.toLocaleDateString()} - ${bookingDetails.endDate.toLocaleDateString()}</p>
        </div>
        `
            : ''
        }
        
        <div class="next-payment">
          <h4>Next Payment</h4>
          <p>Your next rent payment will be due on <strong>${new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</strong>.</p>
        </div>
        
        <p>If you have any questions about this payment or need assistance, please contact our support team.</p>
        
        <div class="footer">
          <p>Thank you for choosing FLY PG!<br><strong>FLY PG Team</strong></p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Payment Confirmation - FLY PG
    
    Dear ${customerName},
    
    Great news! Your rent payment has been successfully processed. Thank you for your timely payment.
    
    PAYMENT DETAILS:
    - Amount Paid: ₹${paymentAmount.toLocaleString()}
    - Due Date: ${dueDate.toLocaleDateString()}
    - Processed Date: ${processedDate.toLocaleDateString()}
    - Payment Method: ${paymentMethod}
    ${transactionId ? `- Transaction ID: ${transactionId}` : ''}
    
    ${
      bookingDetails
        ? `
    BOOKING INFORMATION:
    - Property: ${bookingDetails.property}
    - Room: ${bookingDetails.room}
    - Period: ${bookingDetails.startDate.toLocaleDateString()} - ${bookingDetails.endDate.toLocaleDateString()}
    `
        : ''
    }
    
    NEXT PAYMENT:
    Your next rent payment will be due on ${new Date(dueDate.getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.
    
    If you have any questions about this payment or need assistance, please contact our support team.
    
    Thank you for choosing FLY PG!
    FLY PG Team
    
    This is an automated message. Please do not reply to this email.
  `

  return { subject, html, text }
}
