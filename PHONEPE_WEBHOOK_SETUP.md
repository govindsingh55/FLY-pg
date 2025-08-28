# PhonePe Webhook Configuration Guide

Based on the [PhonePe Webhook Handling documentation](https://developer.phonepe.com/payment-gateway/backend-sdk/nodejs-be-sdk/api-reference-node-js/webhook-handling/), here's how to properly configure webhooks for your PhonePe integration.

## 🔧 **Webhook Configuration Process**

### **Step 1: Contact PhonePe Merchant Support**

**This is MANDATORY** - webhooks cannot be configured through the SDK or API. You must contact PhonePe directly:

1. **Email PhonePe Integration Team** with your merchant details
2. **Request webhook configuration** for your callback URL
3. **Provide your callback endpoint**: `https://yourdomain.com/api/custom/payments/phonepe/callback`
4. **Specify webhook requirements**:
   - Event types: `CHECKOUT_ORDER_COMPLETED`, `CHECKOUT_ORDER_FAILED`
   - Security: Request username/password for webhook authentication
   - Retry policy: Configure retry attempts for failed webhooks

### **Step 2: Webhook Authentication Setup**

According to the PhonePe documentation, webhooks require authentication:

```javascript
// PhonePe will send these in webhook headers:
const authorization = req.headers.get('authorization') // Signature
const username = "MERCHANT_USERNAME" // Configured with PhonePe
const password = "MERCHANT_PASSWORD" // Configured with PhonePe
```

**Request from PhonePe:**
- **Username**: Unique identifier for your webhook
- **Password**: Secret key for webhook authentication
- **Store these securely** in your environment variables

### **Step 3: Environment Variables**

Add these to your `.env` file:

```bash
# PhonePe Webhook Authentication (configured with PhonePe support)
PHONEPE_WEBHOOK_USERNAME=your_webhook_username
PHONEPE_WEBHOOK_PASSWORD=your_webhook_password

# Existing PhonePe SDK credentials
PHONEPE_CLIENT_ID=your_client_id
PHONEPE_CLIENT_SECRET=your_client_secret
PHONEPE_CLIENT_VERSION=1
PHONEPE_ENV=UAT
PHONEPE_BASE_URL=https://api-preprod.phonepe.com/apis/pgsandbox
```

## 📋 **Webhook Event Types**

PhonePe sends different webhook types based on payment status:

| **Event Type** | **Description** | **Payload Contains** |
|----------------|-----------------|---------------------|
| `CHECKOUT_ORDER_COMPLETED` | Payment successful | `orderId`, `originalMerchantOrderId`, `state: "COMPLETED"` |
| `CHECKOUT_ORDER_FAILED` | Payment failed | `orderId`, `originalMerchantOrderId`, `state: "FAILED"` |

### **Webhook Payload Structure**

```json
{
  "type": "CHECKOUT_ORDER_COMPLETED",
  "payload": {
    "merchantId": "MERCHANT_ID",
    "orderId": "OMO2508272033473465404159",
    "originalMerchantOrderId": "BOOK-payment_id",
    "state": "COMPLETED",
    "amount": 620000,
    "expireAt": 1756479827348,
    "paymentDetails": [
      {
        "transactionId": "transaction_id",
        "paymentMode": "UPI",
        "timestamp": 1693123456789,
        "state": "COMPLETED"
      }
    ]
  }
}
```

## 🔍 **Webhook Verification Process**

### **1. Signature Verification**

The webhook callback route verifies authenticity:

```typescript
// Extract signature from headers
const authorization = req.headers.get('authorization')
const xVerify = req.headers.get('x-verify')

// Verify using PhonePe SDK
const isValid = client.validateCallback(
  username,
  password,
  authorization || xVerify,
  JSON.stringify(body)
)
```

### **2. Payment Status Update**

Upon successful verification:

```typescript
// Update payment status
await payload.update({
  collection: 'payments',
  id: paymentId,
  data: {
    status: isSuccess ? 'completed' : 'failed',
    phonepeMerchantTransactionId: merchantTransactionId,
    phonepeTransactionId: orderId,
    phonepeLastState: orderState,
  }
})

// Update booking status
if (isSuccess) {
  await payload.update({
    collection: 'bookings',
    id: bookingId,
    data: { status: 'confirmed' }
  })
}
```

## 🚨 **Webhook Failure Handling**

### **Automatic Retries**
- PhonePe automatically retries failed webhooks
- Retry interval: Typically 5 minutes, 15 minutes, 1 hour
- Maximum retries: Usually 3-5 attempts

### **Manual Status Check**
If webhooks fail, use the status check API:

```bash
GET /api/custom/payments/phonepe/status?paymentId=your_payment_id
```

### **Monitoring & Alerts**
1. **Monitor webhook logs** for failures
2. **Set up alerts** for webhook processing errors
3. **Track callback success rates**
4. **Monitor payment status synchronization**

## 🧪 **Testing Webhooks**

### **UAT Testing**
1. **Configure webhook in UAT environment**
2. **Use PhonePe Test App** for payment simulation
3. **Monitor webhook delivery** in your logs
4. **Verify database updates** after webhook processing

### **Webhook Testing Checklist**
- [ ] Webhook endpoint is accessible
- [ ] Signature verification works
- [ ] Payment status updates correctly
- [ ] Booking status updates correctly
- [ ] Error handling works properly
- [ ] Retry mechanism functions

## 🔐 **Security Best Practices**

1. **Use HTTPS** for webhook endpoints
2. **Verify webhook signatures** before processing
3. **Store webhook credentials securely**
4. **Implement rate limiting** on webhook endpoints
5. **Log all webhook activities** for monitoring
6. **Use unique credentials** for different environments

## 📞 **Support & Troubleshooting**

### **If Webhooks Aren't Working**

1. **Check with PhonePe Support**:
   - Confirm webhook is configured
   - Verify callback URL is accessible
   - Check webhook credentials

2. **Verify Your Implementation**:
   - Test webhook endpoint manually
   - Check signature verification
   - Monitor error logs

3. **Fallback Mechanisms**:
   - Use manual status check API
   - Implement polling for pending payments
   - Set up alerts for failed webhooks

### **Contact Information**
- **PhonePe Integration Team**: Contact through your merchant support channel
- **Reference your merchant ID** when requesting webhook setup
- **Include your callback URL** and environment details

## 📝 **Production Checklist**

Before going live:
- [ ] Webhooks configured with PhonePe support
- [ ] Webhook credentials securely stored
- [ ] Signature verification implemented
- [ ] Error handling and logging in place
- [ ] Monitoring and alerting set up
- [ ] Fallback mechanisms tested
- [ ] UAT testing completed successfully
