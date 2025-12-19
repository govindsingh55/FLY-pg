import { z } from 'zod';

export const paymentSchema = z.object({
	bookingId: z
		.string()
		.optional()
		.transform((e) => (e === '' ? undefined : e)), // Can be linked to booking or just customer
	contractId: z
		.string()
		.optional()
		.transform((e) => (e === '' ? undefined : e)),
	customerId: z.string().min(1, 'Customer is required'),
	amount: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0.01, 'Amount must be positive')),
	type: z
		.enum(['rent', 'security_deposit', 'maintenance', 'booking_charge', 'other'])
		.default('rent'),
	status: z.enum(['pending', 'paid', 'failed', 'refunded']).default('paid'),
	mode: z.enum(['cash', 'online', 'upi']).default('online'),
	transactionId: z
		.string()
		.optional()
		.transform((e) => (e === '' ? undefined : e)),
	paymentMethod: z
		.string()
		.optional()
		.transform((e) => (e === '' ? undefined : e)),
	paymentDate: z
		.union([z.string(), z.number()])
		.pipe(z.coerce.date())
		.default(() => new Date())
});

export type PaymentSchema = z.infer<typeof paymentSchema>;
