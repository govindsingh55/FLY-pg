import { z } from 'zod';

export const propertySchema = z.object({
	name: z.string().min(3, 'Name must be at least 3 characters'),
	description: z.string().optional(),
	address: z.string().min(5, 'Street address is required'),
	sector: z.string().optional(),
	city: z.string().min(2, 'City is required'),
	state: z.string().min(2, 'State is required'),
	zip: z.string().min(4, 'ZIP code is required'),
	lat: z.union([z.string(), z.number()]).pipe(z.coerce.number()).optional(),
	lng: z.union([z.string(), z.number()]).pipe(z.coerce.number()).optional(),
	nearby: z
		.union([
			z.array(
				z.object({
					title: z.string(),
					distance: z.string(),
					image: z.string().optional()
				})
			),
			z.string().transform((val) => {
				try {
					const parsed = JSON.parse(val);
					return Array.isArray(parsed) ? parsed : [];
				} catch {
					return []; // Fallback or handle legacy comma-separated string?
				}
			})
		])
		.optional(),
	contactPhone: z.string().optional(),
	amenities: z
		.union([
			z.array(z.string()),
			z.string().transform((val) =>
				val
					.split(',')
					.map((s) => s.trim())
					.filter((s) => s.length > 0)
			)
		])
		.optional(),
	images: z
		.union([
			z.array(z.string()),
			z.string().transform((val) =>
				val
					.split(',')
					.map((s) => s.trim())
					.filter((s) => s.length > 0)
			)
		])
		.optional(),
	isFoodServiceAvailable: z.boolean().default(false),
	foodMenu: z.string().optional(), // URL
	bookingCharge: z.union([z.string(), z.number()]).pipe(z.coerce.number()).default(0),
	status: z.enum(['draft', 'published']).default('draft')
});

export type PropertySchema = z.infer<typeof propertySchema>;
