import { z } from 'zod';

export const roomSchema = z.object({
	number: z.string().min(1, 'Room number is required'),
	type: z.enum(['single', 'double', 'triple', 'dorm']),
	capacity: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(1, 'Capacity must be at least 1')),
	priceMonthly: z
		.union([z.string(), z.number()])
		.transform((val) => Number(val))
		.pipe(z.number().min(0, 'Price must be positive')),
	depositAmount: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => (val === undefined ? undefined : Number(val)))
		.pipe(z.number().optional()),
	features: z
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
	media: z
		.array(
			z.object({
				url: z.string(),
				type: z.enum(['image', 'video']).default('image')
			})
		)
		.optional()
		.default([]),
	status: z.enum(['available', 'occupied', 'maintenance']).default('available')
});

export type RoomSchema = z.infer<typeof roomSchema>;
