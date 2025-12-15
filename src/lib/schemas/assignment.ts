import { z } from 'zod';

export const assignManagerSchema = z.object({
	userId: z.string().min(1, 'User ID is required'),
	propertyId: z.string().min(1, 'Property ID is required')
});

export const assignStaffSchema = z.object({
	staffProfileId: z.string().min(1, 'Staff Profile ID is required'),
	propertyId: z.string().min(1, 'Property ID is required')
});

export const unassignSchema = z.object({
	assignmentId: z.string().min(1, 'Assignment ID is required')
});

export type AssignManagerSchema = z.infer<typeof assignManagerSchema>;
export type AssignStaffSchema = z.infer<typeof assignStaffSchema>;
export type UnassignSchema = z.infer<typeof unassignSchema>;
