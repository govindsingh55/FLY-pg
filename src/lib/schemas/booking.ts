import { z } from 'zod';

export const bookingSchema = z.object({
	propertyId: z.string().min(1, 'Property is required'),
	roomId: z.string().min(1, 'Room is required'),
	customerId: z.string().min(1, 'Customer is required'),
	// We expect dates as strings from form, coerce to Date
	startDate: z.coerce.date({ message: 'Start date is required' }),
	endDate: z.coerce.date().optional(), // Nullable in DB, but usually required for billing
	rentAmount: z.coerce.number().min(0, 'Rent amount must be positive'),
	securityDeposit: z.coerce.number().optional(),
	status: z.enum(['pending', 'active', 'completed', 'cancelled']).default('pending')
});

export type BookingSchema = z.infer<typeof bookingSchema>;
