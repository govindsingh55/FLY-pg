import { z } from 'zod';

export const amenitySchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	description: z.string().optional(),
	image: z.string().url().optional().or(z.string().length(0)),
	icon: z.string().optional()
});

export type AmenitySchema = z.infer<typeof amenitySchema>;
