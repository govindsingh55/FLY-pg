import { z } from 'zod';

export const ticketSchema = z.object({
	subject: z.string().min(3, 'Subject must be at least 3 characters'),
	description: z.string().min(10, 'Description must be at least 10 characters'),
	priority: z.enum(['low', 'medium', 'high']).default('medium'),
	status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
	type: z.enum(['electricity', 'plumbing', 'furniture', 'wifi', 'other']).default('other'),
	propertyId: z.string().optional() // Optional linkage
});

export type TicketSchema = z.infer<typeof ticketSchema>;
