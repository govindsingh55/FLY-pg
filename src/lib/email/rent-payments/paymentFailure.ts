import type { PaymentFailureData, EmailTemplate } from './types'

/**
 * Payment Failure Notification Email Template
 * Sent to customers when payment processing fails
 */
export function generatePaymentFailureEmail(data: PaymentFailureData): EmailTemplate {
  const {
    customerName,
    paymentAmount,
    dueDate,
    failureReason,
    retryDate,
    supportContact,
    bookingDetails,
  } = data

  const subject = `Payment Failed - ₹${paymentAmount.toLocaleString()}`

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Failed</title>
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
          color: #dc3545;
          margin-bottom: 10px;
        }
        .failure-icon {
          font-size: 48px;
          color: #dc3545;
          margin-bottom: 15px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .payment-card {
          background: #f8d7da;
          border-left: 4px solid #dc3545;
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
          border-bottom: 1px solid #f5c6cb;
        }
        .payment-item:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
          color: #dc3545;
        }
        .failure-notice {
          background: #f8d7da;
          border: 2px solid #dc3545;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
          text-align: center;
        }
        .retry-info {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .support-info {
          background: #e7f3ff;
          border: 1px solid #b3d9ff;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: #dc3545;
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
        .steps {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .step {
          margin: 10px 0;
          padding-left: 20px;
          position: relative;
        }
        .step::before {
          content: counter(step-counter);
          counter-increment: step-counter;
          position: absolute;
          left: 0;
          top: 0;
          background: #007bff;
          color: white;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        .steps {
          counter-reset: step-counter;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">FLY PG</div>
          <div class="failure-icon">❌</div>
          <h1 style="color: #dc3545;">Payment Failed</h1>
        </div>
        
        <div class="greeting">
          Dear ${customerName},
        </div>
        
        <p>We encountered an issue processing your rent payment. Please review the details below and take the necessary action to complete your payment.</p>
        
        <div class="failure-notice">
          <h3 style="color: #dc3545; margin: 0;">Payment Processing Failed</h3>
          <p style="margin: 10px 0 0 0;">We were unable to process your payment at this time.</p>
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
            <div class="payment-item">
              <span>Status:</span>
              <span style="color: #dc3545; font-weight: bold;">Failed</span>
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
        
        <div class="failure-notice">
          <h4 style="color: #dc3545; margin: 0;">Failure Reason</h4>
          <p style="margin: 10px 0 0 0;"><strong>${failureReason}</strong></p>
        </div>
        
        ${
          retryDate
            ? `
        <div class="retry-info">
          <h4>Automatic Retry</h4>
          <p>We will automatically retry your payment on <strong>${retryDate.toLocaleDateString()}</strong>.</p>
          <p>Please ensure your payment method is valid and has sufficient funds.</p>
        </div>
        `
            : ''
        }
        
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
        
        <div class="steps">
          <h4>Next Steps</h4>
          <div class="step">Verify your payment method details are correct</div>
          <div class="step">Ensure sufficient funds are available</div>
          <div class="step">Contact your bank if the issue persists</div>
          <div class="step">Update your payment method if necessary</div>
        </div>
        
        <div style="text-align: center;">
          <a href="#" class="cta-button">Retry Payment</a>
        </div>
        
        <div class="support-info">
          <h4>Need Help?</h4>
          <p>If you continue to experience issues, please contact our support team:</p>
          <p><strong>Support Contact:</strong> ${supportContact}</p>
          <p>Our team is available to help you resolve any payment issues.</p>
        </div>
        
        <p>We apologize for any inconvenience. Please complete your payment as soon as possible to avoid any late fees.</p>
        
        <div class="footer">
          <p>Best regards,<br><strong>FLY PG Team</strong></p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Payment Failed - FLY PG
    
    Dear ${customerName},
    
    We encountered an issue processing your rent payment. Please review the details below and take the necessary action to complete your payment.
    
    PAYMENT DETAILS:
    - Amount: ₹${paymentAmount.toLocaleString()}
    - Due Date: ${dueDate.toLocaleDateString()}
    - Payment Type: Monthly Rent
    - Status: Failed
    ${
      bookingDetails
        ? `
    - Property: ${bookingDetails.property}
    - Room: ${bookingDetails.room}
    - Period: ${bookingDetails.startDate.toLocaleDateString()} - ${bookingDetails.endDate.toLocaleDateString()}
    `
        : ''
    }
    
    FAILURE REASON:
    ${failureReason}
    
    ${
      retryDate
        ? `
    AUTOMATIC RETRY:
    We will automatically retry your payment on ${retryDate.toLocaleDateString()}.
    Please ensure your payment method is valid and has sufficient funds.
    `
        : ''
    }
    
    NEXT STEPS:
    1. Verify your payment method details are correct
    2. Ensure sufficient funds are available
    3. Contact your bank if the issue persists
    4. Update your payment method if necessary
    
    NEED HELP?
    If you continue to experience issues, please contact our support team:
    Support Contact: ${supportContact}
    
    We apologize for any inconvenience. Please complete your payment as soon as possible to avoid any late fees.
    
    Best regards,
    FLY PG Team
    
    This is an automated message. Please do not reply to this email.
  `

  return { subject, html, text }
}
