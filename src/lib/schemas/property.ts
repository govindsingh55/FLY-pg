import { z } from 'zod';

export const propertySchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters'),
	description: z.string().optional(),
	address: z.string().min(5, 'Address is required'),
	city: z.string().optional(),
	state: z.string().optional(),
	zip: z.string().optional(),
	contactPhone: z.string().optional(),
	amenities: z.array(z.string()).optional(),
	images: z.array(z.string()).optional() // Array of URLs
});

export type PropertySchema = z.infer<typeof propertySchema>;
