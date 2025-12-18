import { z } from 'zod';

export const foodMenuItemSchema = z.object({
	category: z.enum(['breakfast', 'lunch', 'dinner', 'snacks']),
	name: z.string().min(2, 'Name must be at least 2 characters'),
	description: z.string().optional(),
	isVegetarian: z.boolean().default(true),
	isAvailable: z.boolean().default(true),
	price: z.coerce.number().optional()
});

export type FoodMenuItemSchema = z.infer<typeof foodMenuItemSchema>;
