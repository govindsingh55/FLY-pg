import type { OverdueNotificationData, EmailTemplate } from './types'

/**
 * Overdue Payment Notification Email Template
 * Sent to customers when their payment is overdue
 */
export function generateOverdueNotificationEmail(data: OverdueNotificationData): EmailTemplate {
  const {
    customerName,
    paymentAmount,
    dueDate,
    daysOverdue,
    urgencyLevel,
    lateFees,
    bookingDetails,
  } = data

  // Determine urgency styling and messaging
  const urgencyConfig = {
    low: {
      color: '#007bff',
      borderColor: '#007bff',
      bgColor: '#e7f3ff',
      icon: '⚠️',
      title: 'Payment Overdue',
    },
    medium: {
      color: '#ffc107',
      borderColor: '#ffc107',
      bgColor: '#fff3cd',
      icon: '⚠️',
      title: 'Payment Overdue',
    },
    high: {
      color: '#fd7e14',
      borderColor: '#fd7e14',
      bgColor: '#fff3e0',
      icon: '🚨',
      title: 'Important: Payment Overdue',
    },
    critical: {
      color: '#dc3545',
      borderColor: '#dc3545',
      bgColor: '#f8d7da',
      icon: '🚨',
      title: 'URGENT: Payment Severely Overdue',
    },
  }

  const config = urgencyConfig[urgencyLevel]

  const subject = `${config.title} - ${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue`

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Overdue Payment Notification</title>
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
        .urgency-icon {
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
        .days-overdue {
          background: ${config.bgColor};
          border: 2px solid ${config.borderColor};
          padding: 20px;
          border-radius: 4px;
          text-align: center;
          margin: 20px 0;
          font-size: 18px;
          font-weight: bold;
          color: ${config.color};
        }
        .urgent-notice {
          background: #f8d7da;
          border: 2px solid #dc3545;
          padding: 20px;
          border-radius: 4px;
          margin: 20px 0;
          text-align: center;
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
        .late-fees {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
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
          <div class="urgency-icon">${config.icon}</div>
          <h1 style="color: ${config.color};">${config.title}</h1>
        </div>
        
        <div class="greeting">
          Dear ${customerName},
        </div>
        
        <p>Your rent payment is overdue and requires immediate attention. Please make your payment as soon as possible to avoid any additional late fees or penalties.</p>
        
        <div class="days-overdue">
          <strong>${daysOverdue} day${daysOverdue > 1 ? 's' : ''} overdue</strong>
        </div>
        
        ${
          urgencyLevel === 'critical'
            ? `
        <div class="urgent-notice">
          <h3 style="color: #dc3545; margin: 0;">⚠️ IMMEDIATE ACTION REQUIRED</h3>
          <p style="margin: 10px 0 0 0;">This payment is severely overdue. Please contact us immediately to resolve this matter.</p>
        </div>
        `
            : ''
        }
        
        <div class="payment-card">
          <h3>Payment Details</h3>
          <div class="payment-details">
            <div class="payment-item">
              <span>Amount Due:</span>
              <span>₹${paymentAmount.toLocaleString()}</span>
            </div>
            <div class="payment-item">
              <span>Due Date:</span>
              <span>${dueDate.toLocaleDateString()}</span>
            </div>
            <div class="payment-item">
              <span>Days Overdue:</span>
              <span style="color: ${config.color}; font-weight: bold;">${daysOverdue} day${daysOverdue > 1 ? 's' : ''}</span>
            </div>
            <div class="payment-item">
              <span>Payment Type:</span>
              <span>Monthly Rent</span>
            </div>
            ${
              lateFees
                ? `
            <div class="payment-item">
              <span>Late Fees:</span>
              <span style="color: #dc3545; font-weight: bold;">₹${lateFees.toLocaleString()}</span>
            </div>
            `
                : ''
            }
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
          lateFees
            ? `
        <div class="late-fees">
          <h4>Late Fees Applied</h4>
          <p>A late fee of <strong>₹${lateFees.toLocaleString()}</strong> has been applied to your account. Please include this amount in your payment.</p>
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
        
        <div style="text-align: center;">
          <a href="#" class="cta-button">Make Payment Now</a>
        </div>
        
        <p>If you have any questions or need to discuss payment arrangements, please contact our support team immediately.</p>
        
        <div class="footer">
          <p>Best regards,<br><strong>FLY PG Team</strong></p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    ${config.title} - FLY PG
    
    Dear ${customerName},
    
    Your rent payment is overdue and requires immediate attention. Please make your payment as soon as possible to avoid any additional late fees or penalties.
    
    PAYMENT DETAILS:
    - Amount Due: ₹${paymentAmount.toLocaleString()}
    - Due Date: ${dueDate.toLocaleDateString()}
    - Days Overdue: ${daysOverdue} day${daysOverdue > 1 ? 's' : ''}
    - Payment Type: Monthly Rent
    ${lateFees ? `- Late Fees: ₹${lateFees.toLocaleString()}` : ''}
    ${
      bookingDetails
        ? `
    - Property: ${bookingDetails.property}
    - Room: ${bookingDetails.room}
    - Period: ${bookingDetails.startDate.toLocaleDateString()} - ${bookingDetails.endDate.toLocaleDateString()}
    `
        : ''
    }
    
    ${urgencyLevel === 'critical' ? '⚠️ IMMEDIATE ACTION REQUIRED: This payment is severely overdue. Please contact us immediately to resolve this matter.' : ''}
    
    ${lateFees ? `LATE FEES: A late fee of ₹${lateFees.toLocaleString()} has been applied to your account. Please include this amount in your payment.` : ''}
    
    If you have any questions or need to discuss payment arrangements, please contact our support team immediately.
    
    Best regards,
    FLY PG Team
    
    This is an automated message. Please do not reply to this email.
  `

  return { subject, html, text }
}
