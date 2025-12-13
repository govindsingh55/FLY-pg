import { z } from 'zod';

export const customerSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.string().email('Invalid email address'),
	phone: z.string().min(10, 'Phone must be at least 10 digits'),
	addressPermanent: z.string().optional(),
	idProofType: z.string().optional(),
	idProofNumber: z.string().optional(),
	emergencyContactName: z.string().optional(),
	emergencyContactPhone: z.string().optional(),
	status: z.enum(['active', 'inactive']).default('active')
});

export type CustomerSchema = z.infer<typeof customerSchema>;
