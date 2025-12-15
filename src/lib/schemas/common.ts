import { z } from 'zod';

export const updateUserSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters').optional(),
	image: z.string().url().optional().or(z.literal(''))
	// Add other user fields as needed, e.g. phone if we migrate it to user table
});

export const notificationSchema = z.object({
	title: z.string().optional(),
	message: z.string().min(1, 'Message is required'),
	type: z.enum(['info', 'warning', 'success', 'error']).default('info'),
	userId: z.string().min(1, 'User ID is required')
});

export type UpdateUserSchema = z.infer<typeof updateUserSchema>;
export type NotificationSchema = z.infer<typeof notificationSchema>;
