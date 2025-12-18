import { z } from 'zod';

export const ticketSchema = z.object({
	id: z.string().optional(),
	customerId: z.string().optional(),
	propertyId: z.string().optional(),
	roomId: z.string().optional(),
	subject: z.string().min(3, 'Subject must be at least 3 characters'),
	description: z.string().min(10, 'Description must be at least 10 characters'),
	priority: z.enum(['low', 'medium', 'high']).default('medium'),
	status: z.enum(['open', 'in_progress', 'resolved', 'closed']).default('open'),
	type: z.enum(['electricity', 'plumbing', 'furniture', 'wifi', 'other']).default('other'),
	assignedTo: z.string().optional()
});

export const ticketMessageSchema = z.object({
	ticketId: z.string().min(1),
	content: z.string().min(1, 'Message content cannot be empty')
});

export type TicketSchema = z.infer<typeof ticketSchema>;
export type TicketMessageSchema = z.infer<typeof ticketMessageSchema>;
