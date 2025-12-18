import { z } from 'zod';

export const mediaSchema = z.object({
	url: z.string().url('Invalid URL'),
	type: z.enum(['image', 'document', 'video', 'other']).default('image'),
	propertyId: z.string().optional(),
	roomId: z.string().optional()
});

export const mediaUpdateSchema = mediaSchema.extend({
	id: z.string()
});

export type MediaSchema = z.infer<typeof mediaSchema>;
export type MediaUpdateSchema = z.infer<typeof mediaUpdateSchema>;
