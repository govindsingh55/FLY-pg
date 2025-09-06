import type { AutoPayStatusData, EmailTemplate } from './types'

/**
 * Auto-Pay Processing Status Email Template
 * Sent to customers for auto-pay confirmations and failures
 */
export function generateAutoPayStatusEmail(data: AutoPayStatusData): EmailTemplate {
  const {
    customerName,
    paymentAmount,
    dueDate,
    status,
    processedDate,
    nextAutoPayDate,
    failureReason,
    bookingDetails,
  } = data

  // Determine status styling and messaging
  const statusConfig = {
    success: {
      color: '#28a745',
      borderColor: '#28a745',
      bgColor: '#e8f5e8',
      icon: '✓',
      title: 'Auto-Pay Payment Confirmation',
      message: 'Your rent payment has been automatically processed successfully.',
    },
    failed: {
      color: '#dc3545',
      borderColor: '#dc3545',
      bgColor: '#f8d7da',
      icon: '❌',
      title: 'Auto-Pay Payment Failed',
      message: 'Your automatic payment could not be processed.',
    },
    processing: {
      color: '#007bff',
      borderColor: '#007bff',
      bgColor: '#e7f3ff',
      icon: '⏳',
      title: 'Auto-Pay Payment Processing',
      message: 'Your automatic payment is being processed.',
    },
  }

  const config = statusConfig[status]

  const subject = `${config.title} - ₹${paymentAmount.toLocaleString()}`

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Auto-Pay Status</title>
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
          color: ${config.color};
          margin-bottom: 10px;
        }
        .status-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }
        .greeting {
          font-size: 18px;
          margin-bottom: 20px;
        }
        .payment-card {
          background: ${config.bgColor};
          border-left: 4px solid ${config.borderColor};
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
          border-bottom: 1px solid rgba(0,0,0,0.1);
        }
        .payment-item:last-child {
          border-bottom: none;
          font-weight: bold;
          font-size: 18px;
          color: ${config.color};
        }
        .status-badge {
          display: inline-block;
          background: ${config.color};
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 12px;
        }
        .failure-notice {
          background: #f8d7da;
          border: 2px solid #dc3545;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .next-payment {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
        }
        .cta-button {
          display: inline-block;
          background: ${config.color};
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
          <div class="status-icon">${config.icon}</div>
          <h1 style="color: ${config.color};">${config.title}</h1>
        </div>
        
        <div class="greeting">
          Dear ${customerName},
        </div>
        
        <p>${config.message}</p>
        
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
              <span>Processed Date:</span>
              <span>${processedDate.toLocaleDateString()}</span>
            </div>
            <div class="payment-item">
              <span>Payment Type:</span>
              <span>Monthly Rent</span>
            </div>
            <div class="payment-item">
              <span>Method:</span>
              <span>Auto-Pay</span>
            </div>
            <div class="payment-item">
              <span>Status:</span>
              <span class="status-badge">${status}</span>
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
          status === 'failed' && failureReason
            ? `
        <div class="failure-notice">
          <h4 style="color: #dc3545; margin: 0;">Payment Failed</h4>
          <p style="margin: 10px 0 0 0;"><strong>Reason:</strong> ${failureReason}</p>
          <p style="margin: 10px 0 0 0;">Please update your payment method or contact support for assistance.</p>
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
        
        ${
          status === 'success' && nextAutoPayDate
            ? `
        <div class="next-payment">
          <h4>Next Auto-Pay</h4>
          <p>Your next automatic payment is scheduled for <strong>${nextAutoPayDate.toLocaleDateString()}</strong>.</p>
        </div>
        `
            : ''
        }
        
        ${
          status === 'failed'
            ? `
        <div style="text-align: center;">
          <a href="#" class="cta-button">Update Payment Method</a>
        </div>
        `
            : ''
        }
        
        <p>${status === 'success' ? 'Your payment has been processed automatically as scheduled. No further action is required.' : status === 'failed' ? 'Please update your payment method or contact our support team for assistance.' : 'We will notify you once the payment is completed.'}</p>
        
        <div class="footer">
          <p>${status === 'success' ? 'Thank you for using our auto-pay service!' : 'FLY PG Team'}<br><strong>FLY PG Team</strong></p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    ${config.title} - FLY PG
    
    Dear ${customerName},
    
    ${config.message}
    
    PAYMENT DETAILS:
    - Amount: ₹${paymentAmount.toLocaleString()}
    - Due Date: ${dueDate.toLocaleDateString()}
    - Processed Date: ${processedDate.toLocaleDateString()}
    - Payment Type: Monthly Rent
    - Method: Auto-Pay
    - Status: ${status.toUpperCase()}
    ${
      bookingDetails
        ? `
    - Property: ${bookingDetails.property}
    - Room: ${bookingDetails.room}
    - Period: ${bookingDetails.startDate.toLocaleDateString()} - ${bookingDetails.endDate.toLocaleDateString()}
    `
        : ''
    }
    
    ${
      status === 'failed' && failureReason
        ? `
    PAYMENT FAILED:
    Reason: ${failureReason}
    Please update your payment method or contact support for assistance.
    `
        : ''
    }
    
    ${
      status === 'success' && nextAutoPayDate
        ? `
    NEXT AUTO-PAY:
    Your next automatic payment is scheduled for ${nextAutoPayDate.toLocaleDateString()}.
    `
        : ''
    }
    
    ${status === 'success' ? 'Your payment has been processed automatically as scheduled. No further action is required.' : status === 'failed' ? 'Please update your payment method or contact our support team for assistance.' : 'We will notify you once the payment is completed.'}
    
    ${status === 'success' ? 'Thank you for using our auto-pay service!' : ''}
    FLY PG Team
    
    This is an automated message. Please do not reply to this email.
  `

  return { subject, html, text }
}
