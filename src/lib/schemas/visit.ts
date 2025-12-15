import { z } from 'zod';

export type VisitBooking = {
	id: string;
	propertyId: string;
	customerId: string;
	visitDate: string | Date;
	visitTime: string | Date;
	status: 'pending' | 'accepted' | 'cancelled';
	createdAt: string | Date;
	updatedAt: string | Date | null;
	deletedAt: string | Date | null;
};

export const requestVisitSchema = z.object({
	propertyId: z.string().min(1, 'Property selection is required'),
	visitDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
		message: 'Invalid date format'
	}), // Expecting YYYY-MM-DD
	visitTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format') // HH:MM
});

export const updateVisitStatusSchema = z.object({
	visitId: z.string().min(1, 'Visit ID is required'),
	status: z.enum(['accepted', 'rejected'])
});

export const cancelVisitSchema = z.object({
	visitId: z.string().min(1, 'Visit ID is required'),
	reason: z.string().min(1, 'Cancellation reason is required')
});

export type RequestVisitSchema = z.infer<typeof requestVisitSchema>;
export type UpdateVisitStatusSchema = z.infer<typeof updateVisitStatusSchema>;
export type CancelVisitSchema = z.infer<typeof cancelVisitSchema>;
