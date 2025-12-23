import { z } from 'zod';

// Base payment data schema - shared fields
const basePaymentSchema = z.object({
	contractId: z
		.string()
		.optional()
		.transform((e) => (e === '' ? undefined : e)),
	bookingId: z
		.string()
		.optional()
		.transform((e) => (e === '' ? undefined : e)),
	amount: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0.01, 'Amount must be positive')),
	type: z.enum([
		'rent',
		'security_deposit',
		'maintenance',
		'booking_charge',
		'electricity',
		'other'
	]),
	mode: z.enum(['cash', 'online', 'upi']),
	transactionId: z
		.string()
		.optional()
		.transform((e) => (e === '' ? undefined : e)),
	paymentMethod: z
		.string()
		.optional()
		.transform((e) => (e === '' ? undefined : e))
});

// Admin payment schema - full control over all fields
export const paymentSchema = basePaymentSchema.extend({
	customerId: z.string().min(1, 'Customer is required'),
	status: z.enum(['pending', 'paid', 'failed', 'refunded']).default('paid'),
	paymentDate: z
		.union([z.string(), z.number()])
		.pipe(z.coerce.date())
		.default(() => new Date())
});

export type PaymentSchema = z.infer<typeof paymentSchema>;

// Customer payment submission schema - restricted fields
// Customer ID is inferred from session, status/paymentDate are auto-set
export const customerPaymentSchema = basePaymentSchema
	.extend({
		type: z.enum(['rent', 'electricity', 'other']).default('rent') // Limited types for customers
	})
	.refine((data) => data.contractId || data.bookingId, {
		message: 'Either contract or booking is required',
		path: ['contractId']
	})
	.refine(
		(data) => {
			// Transaction ID required for online/UPI payments
			if (data.mode === 'online' || data.mode === 'upi') {
				return !!data.transactionId && data.transactionId.trim().length > 0;
			}
			return true;
		},
		{
			message: 'Transaction ID is required for online and UPI payments',
			path: ['transactionId']
		}
	);

export type CustomerPaymentSchema = z.infer<typeof customerPaymentSchema>;
