import { z } from 'zod';

export const contractSchema = z.object({
	id: z.string().optional(),
	customerId: z.string().min(1, 'Customer is required'),
	propertyId: z.string().min(1, 'Property is required'),
	roomId: z.string().min(1, 'Room is required'),
	bookingId: z.string().optional(),
	contractType: z.enum(['rent', 'lease', 'other']).default('rent'),
	startDate: z.coerce.date(),
	endDate: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.date().optional()),
	rentAmount: z.coerce.number().min(0, 'Rent amount must be valid'),
	securityDeposit: z.coerce.number().min(0, 'Security deposit must be valid').optional().default(0),
	includeFood: z.boolean().default(false),
	status: z.enum(['active', 'expired', 'terminated']).default('active'),
	terminationDate: z.preprocess((v) => (v === '' ? undefined : v), z.coerce.date().optional()),
	terminationReason: z.string().optional(),
	notes: z.string().optional(),
	documentUrl: z.string().optional()
});

export type ContractSchema = z.infer<typeof contractSchema>;

export const updateContractSchema = contractSchema.pick({
	rentAmount: true,
	securityDeposit: true,
	startDate: true,
	endDate: true,
	status: true,
	includeFood: true,
	contractType: true,
	terminationDate: true,
	terminationReason: true,
	notes: true,
	documentUrl: true
});

export type UpdateContractSchema = z.infer<typeof updateContractSchema>;
