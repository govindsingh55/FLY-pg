import { z } from 'zod';

export const bookingSchema = z.object({
	propertyId: z.string().min(1, 'Property is required'),
	roomId: z.string().min(1, 'Room is required'),
	customerId: z.string().min(1, 'Customer is required'),
	// We expect dates as valid ISO strings from form
	startDate: z
		.string()
		.min(1, 'Start date is required')
		.transform((val) => new Date(val))
		.pipe(z.date()),
	endDate: z
		.string()
		.optional()
		.transform((val) => {
			if (!val) return undefined;
			const d = new Date(val);
			return isNaN(d.getTime()) ? undefined : d;
		})
		.pipe(z.date().optional()),
	rentAmount: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0, 'Rent amount must be positive')),
	securityDeposit: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => (val === '' || val === undefined ? undefined : Number(val)))
		.pipe(z.number().optional()),
	includeFood: z
		.union([z.boolean(), z.string()])
		.default(false)
		.transform((val) => val === true || val === 'true' || val === 'on'),
	status: z.enum(['pending', 'active', 'completed', 'cancelled']).default('pending')
});

export type BookingSchema = z.infer<typeof bookingSchema>;
