import { z } from 'zod';

export const systemSettingsSchema = z.object({
	allow_manager_delete: z.boolean().default(false)
});

export type SystemSettingsSchema = z.infer<typeof systemSettingsSchema>;
