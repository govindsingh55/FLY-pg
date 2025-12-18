import { z } from 'zod';

export const amenitySchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	description: z.string().optional(),
	image: z.string().url('Invalid image URL').or(z.literal('')).optional(),
	icon: z.string().optional()
});

export type AmenitySchema = z.infer<typeof amenitySchema>;
