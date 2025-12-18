import { z } from 'zod';

export const mediaSchema = z.object({
	url: z.string().url(),
	type: z.enum(['image', 'document', 'video', 'other']).default('image')
});

export type MediaSchema = z.infer<typeof mediaSchema>;
