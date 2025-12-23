# Payment Gateway Integration Guide

## Overview

This document outlines the current manual payment workflow and provides a comprehensive roadmap for future payment gateway integration (Stripe, Razorpay, PayPal, etc.).

---

## Current Manual Payment Workflow

### Customer Payment Submission

1. Customer receives rent/electricity notification (manual or automated)
2. Customer navigates to Dashboard → Payments → Submit Payment
3. Customer selects active contract and enters payment details:
   - **Cash**: Auto-approved, payment recorded immediately
   - **UPI/Online**: Pending status, requires admin verification
4. For online/UPI: Customer provides transaction ID from payment app
5. Payment appears in customer's payment history

### Admin Payment Verification

1. Admin/Manager/Property Manager navigates to Admin → Payments
2. Filter by "Pending" status to view unverified payments
3. View transaction ID and payment method details
4. Verify transaction authenticity:
   - **Valid**: Click "Verify" → Status changes to "Paid"
   - **Invalid**: Click "Reject" → Status changes to "Failed"
5. Customer notified of status change

### Access Control

- **Admin/Manager**: Can verify all payments
- **Property Manager**: Can only verify payments for assigned properties
- **Customer**: Can only submit payments for their own contracts

---

## Database Schema (Current State)

### Payments Table

```typescript
{
  id: string (UUID)
  bookingId: string | null
  contractId: string | null
  customerId: string
  amount: number
  type: 'rent' | 'security_deposit' | 'maintenance' | 'booking_charge' | 'electricity' | 'other'
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  mode: 'cash' | 'online' | 'upi'
  transactionId: string | null        // ✅ Ready for gateway transaction ID
  paymentMethod: string | null         // ✅ Ready for gateway name
  paymentDate: timestamp | null
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Schema Readiness

| Field               | Current Use                                      | Gateway Use                               | Status                |
| ------------------- | ------------------------------------------------ | ----------------------------------------- | --------------------- |
| `transactionId`     | Customer-provided UPI/bank transaction ID        | Gateway transaction/payment intent ID     | ✅ Ready              |
| `paymentMethod`     | Customer-provided method name (Google Pay, etc.) | Gateway identifier (stripe, razorpay)     | ✅ Ready              |
| `status`            | pending/paid/failed/refunded                     | Same statuses apply                       | ✅ Ready              |
| `mode`              | cash/online/upi                                  | Add 'gateway' mode                        | ⚠️ Needs enum update  |
| `gatewayResponse`   | N/A                                              | Store full gateway response JSON          | ❌ Need to add        |
| `gatewayCustomerId` | N/A                                              | Store gateway customer ID for saved cards | ❌ Optional (Phase 2) |

---

## Future Payment Gateway Integration

### Phase 1: Gateway Selection & Setup

#### Recommended Gateways

**For India**:

- **Razorpay**: Best for Indian market, INR support, UPI integration
- **Stripe**: Global, excellent DX, recurring payments

**For Global**:

- **Stripe**: Industry standard
- **PayPal**: Wide user adoption

#### Environment Setup

```env
# .env
PAYMENT_GATEWAY=razorpay  # or stripe, paypal
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxx

# Or for Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

---

### Phase 2: Schema Updates

#### Add Gateway Fields

```sql
ALTER TABLE payments ADD COLUMN gateway_response TEXT;
ALTER TABLE payments ADD COLUMN gateway_customer_id TEXT;
ALTER TABLE payments ADD COLUMN gateway_payment_id TEXT;

-- Update mode enum
-- mode: 'cash' | 'online' | 'upi' | 'gateway'
```

#### System Settings

```typescript
// systemSettings table
{
  paymentGatewayEnabled: boolean
  paymentGatewayProvider: 'razorpay' | 'stripe' | 'paypal'
  paymentGatewayMode: 'test' | 'live'
}
```

---

### Phase 3: Implementation

#### Backend Changes

**1. Gateway Service Abstraction**

```typescript
// src/lib/server/payment-gateway/index.ts
export interface PaymentGateway {
  createPaymentIntent(amount: number, metadata: any): Promise<PaymentIntent>;
  verifyWebhook(signature: string, body: string): boolean;
  refund(paymentId: string, amount?: number): Promise<Refund>;
}

// src/lib/server/payment-gateway/razorpay.ts
export class RazorpayGateway implements PaymentGateway {
  // Implementation
}

// src/lib/server/payment-gateway/factory.ts
export function getGateway(): PaymentGateway {
  const provider = env.PAYMENT_GATEWAY;
  switch (provider) {
    case 'razorpay': return new RazorpayGateway();
    case 'stripe': return new StripeGateway();
    default: throw new Error('Invalid gateway');
  }
}
```

**2. Payment Intent Creation**

```typescript
// src/routes/dashboard/payments/create-intent.remote.ts
export const createPaymentIntent = form(
  z.object({ contractId: z.string(), amount: z.number(), type: z.enum(['rent', 'electricity']) }),
  async (data) => {
    const gateway = getGateway();

    // Create payment intent
    const intent = await gateway.createPaymentIntent(data.amount, {
      contractId: data.contractId,
      customerId: customer.id,
      type: data.type
    });

    // Create pending payment record
    await db.insert(payments).values({
      customerId: customer.id,
      contractId: data.contractId,
      amount: data.amount,
      type: data.type,
      mode: 'gateway',
      status: 'pending',
      gatewayPaymentId: intent.id
    });

    return { clientSecret: intent.clientSecret };
  }
);
```

**3. Webhook Handler**

```typescript
// src/routes/api/webhooks/payment/+server.ts
export async function POST({ request }) {
  const signature = request.headers.get('x-razorpay-signature');
  const body = await request.text();

  const gateway = getGateway();

  // Verify webhook
  if (!gateway.verifyWebhook(signature, body)) {
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(body);

  // Handle payment success
  if (event.event === 'payment.captured') {
    await db.update(payments)
      .set({
        status: 'paid',
        paymentDate: new Date(),
        transactionId: event.payload.payment.id,
        gatewayResponse: JSON.stringify(event.payload)
      })
      .where(eq(payments.gatewayPaymentId, event.payload.payment.id));
  }

  // Handle payment failure
  if (event.event === 'payment.failed') {
    await db.update(payments)
      .set({ status: 'failed', gatewayResponse: JSON.stringify(event.payload) })
      .where(eq(payments.gatewayPaymentId, event.payload.payment.id));
  }

  return new Response('OK');
}
```

#### Frontend Changes

**1. Payment Gateway Component**

```svelte
<!-- payment-gateway-form.svelte -->
<script>
	import { loadScript } from '@paystack/inline-js';

	async function handleGatewayPayment() {
		// Create payment intent
		const { clientSecret } = await createPaymentIntent({ contractId, amount, type });

		// Load gateway SDK
		const razorpay = new Razorpay({
			key: publicKey,
			amount: amount * 100,
			currency: 'INR',
			name: 'FLY PG',
			description: `${type} payment`,
			order_id: clientSecret,
			handler: function (response) {
				toast.success('Payment successful');
				goto('/dashboard/payments');
			},
			prefill: {
				name: customer.name,
				email: customer.email
			}
		});

		razorpay.open();
	}
</script>
```

**2. Update Payment Submission Form**

```svelte
<!-- Add gateway option to payment modes -->
<Select.Item value="gateway">Pay Online (Card/UPI/Netbanking)</Select.Item>

{#if mode === 'gateway'}
	<Button onclick={handleGatewayPayment}>
		Pay ${amount} via Razorpay
	</Button>
{/if}
```

---

### Phase 4: Migration Strategy

#### Dual Mode Operation

```typescript
// System setting determines mode
const gatewayEnabled = await db.query.systemSettings.findFirst({
  where: { key: 'paymentGatewayEnabled' }
});

if (gatewayEnabled?.value === 'true') {
  // Show gateway payment option
} else {
  // Show manual payment option only
}
```

#### Fallback to Manual

- Keep manual workflow active
- Allow admin override if gateway fails
- Provide manual entry for offline payments

---

## Testing Plan

### Test Mode

1. Use gateway test credentials
2. Use test cards/UPI IDs
3. Verify webhook handling in development
4. Test refund workflow

### Razorpay Test Cards

```
Success: 4111 1111 1111 1111
Failure: 4000 0000 0000 0002
```

### Webhook Testing

```bash
# Use ngrok for local webhook testing
ngrok http 5173

# Update webhook URL in gateway dashboard
https://xxxx.ngrok.io/api/webhooks/payment
```

---

## Security Considerations

### API Keys

- ✅ Store in environment variables (never commit)
- ✅ Use test keys in development
- ✅ Rotate keys periodically
- ✅ Restrict API key permissions

### Webhook Verification

- ✅ Always verify webhook signatures
- ✅ Use HTTPS only
- ✅ Implement replay attack prevention

### Data Storage

- ✅ Store gateway response as JSON for audit trail
- ✅ Log all gateway interactions
- ✅ Never store card details (PCI compliance)

---

## Cost Estimation

### Razorpay Pricing (India)

- **Domestic Cards**: 2% per transaction
- **International Cards**: 3% + ₹3 per transaction
- **UPI/Netbanking**: ₹2-3 per transaction
- **No setup fees**

### Stripe Pricing (Global)

- **Cards**: 2.9% + $0.30 per transaction
- **Higher for international cards**

---

## Rollout Plan

### Phase 1 (Week 1): Setup

- [ ] Choose gateway provider
- [ ] Setup test account
- [ ] Add environment variables
- [ ] Install gateway SDK

### Phase 2 (Week 2): Backend

- [ ] Create gateway service abstraction
- [ ] Implement payment intent creation
- [ ] Add webhook handler
- [ ] Update database schema

### Phase 3 (Week 3): Frontend

- [ ] Create gateway payment component
- [ ] Update payment submission form
- [ ] Add payment success/failure handling
- [ ] Test with test cards

### Phase 4 (Week 4): Testing & Launch

- [ ] End-to-end testing
- [ ] Webhook testing
- [ ] Load testing
- [ ] Switch to live mode
- [ ] Monitor first transactions

---

## Support & Monitoring

### Gateway Dashboard

- Monitor transactions in real-time
- View payment analytics
- Export transaction data
- Manage refunds

### Application Logging

```typescript
// src/lib/server/logger.ts
logger.info('Payment intent created', {
  paymentId: payment.id,
  amount: payment.amount,
  gateway: 'razorpay'
});

logger.error('Payment failed', {
  paymentId: payment.id,
  error: error.message,
  gatewayResponse: response
});
```

### Alerts

- Failed webhook deliveries
- High payment failure rate
- Suspicious transactions
- Gateway API errors

---

## FAQs

### Q: Can we support multiple gateways?

Yes, the abstraction layer supports multiple gateways. Add provider selection in system settings.

### Q: What if gateway is down?

Fallback to manual payment workflow. Admin can create payments manually.

### Q: How to handle refunds?

Use gateway refund API. Update payment status to 'refunded' and create refund record.

### Q: Is saved card support needed?

Optional Phase 2 feature. Requires storing `gatewayCustomerId`.

---

## Resources

### Documentation

- [Razorpay Docs](https://razorpay.com/docs/)
- [Stripe Docs](https://stripe.com/docs)
- [PayPal Docs](https://developer.paypal.com/docs/)

### SvelteKit Integration

- [SvelteKit + Stripe Example](https://github.com/vercel/sveltekit-commerce)
- [Webhook Handling in SvelteKit](https://kit.svelte.dev/docs/routing#server)

---

## Conclusion

The current manual payment workflow provides a solid foundation for gateway integration. The database schema is ready with minimal changes needed. Gateway integration can be implemented incrementally while maintaining the manual workflow as a fallback.

**Estimated Implementation Time**: 3-4 weeks  
**Recommended Gateway**: Razorpay (for India), Stripe (for global)  
**Risk**: Low (manual fallback available)
