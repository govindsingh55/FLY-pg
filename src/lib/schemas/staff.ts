import { z } from 'zod';

export const createStaffSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	password: z.string().min(6, 'Password must be at least 6 characters'),
	staffType: z.enum(['chef', 'janitor', 'security'])
});

export const updateStaffSchema = z.object({
	id: z.string(),
	staffType: z.enum(['chef', 'janitor', 'security'])
});

export type CreateStaffSchema = z.infer<typeof createStaffSchema>;
export type UpdateStaffSchema = z.infer<typeof updateStaffSchema>;
