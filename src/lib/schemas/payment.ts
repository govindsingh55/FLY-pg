import { z } from 'zod';

export const paymentSchema = z.object({
	bookingId: z.string().optional(), // Can be linked to booking or just customer
	customerId: z.string().min(1, 'Customer is required'),
	amount: z.coerce.number().min(0.01, 'Amount must be positive'),
	type: z.enum(['rent', 'security_deposit', 'maintenance', 'other']).default('rent'),
	status: z.enum(['pending', 'paid', 'failed', 'refunded']).default('paid'),
	transactionId: z.string().optional(),
	paymentMethod: z.string().optional(),
	paymentDate: z.coerce.date().default(() => new Date())
});

export type PaymentSchema = z.infer<typeof paymentSchema>;
