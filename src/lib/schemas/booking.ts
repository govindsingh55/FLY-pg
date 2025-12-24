import { z } from 'zod';

export const bookingSchema = z.object({
	propertyId: z.string().min(1, 'Property is required'),
	roomId: z.string().min(1, 'Room is required'),
	customerId: z.string().min(1, 'Customer is required'),
	bookingCharge: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0, 'Booking charge must be valid')),
	status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']).default('pending')
});

// Simplified schema for public bookings - property/customer filled server-side
export const publicBookingSchema = z.object({
	roomId: z.string().min(1, 'Please select a room'),
	propertyId: z.string().min(1, 'Property is required')
});

export type BookingSchema = z.infer<typeof bookingSchema>;
export type PublicBookingSchema = z.infer<typeof publicBookingSchema>;
