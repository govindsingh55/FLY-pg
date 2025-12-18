import { form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { systemSettings } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getSettings = query(async () => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

	const settings = await db.query.systemSettings.findMany();
	const settingsMap: Record<string, unknown> = {};
	settings.forEach((s) => {
		settingsMap[s.settingKey] = s.settingValue;
	});

	return { settings: settingsMap };
});

// Since checkboxes in FormData are tricky (omitted if false),
// and schema validation runs on the input,
// We use union allows valid form types (string | boolean) and transform.
const checkboxSchema = z
	.union([z.boolean(), z.string()])
	.optional()
	.transform((value) => {
		if (value === 'on' || value === 'true' || value === true) return true;
		return false;
	});

export const updateSettings = form(
	z.object({
		allow_manager_delete: checkboxSchema
	}),
	async ({ allow_manager_delete }) => {
		const { sessionUser } = getSession();
		if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

		// Upsert setting
		const existing = await db.query.systemSettings.findFirst({
			where: { settingKey: 'allow_manager_delete' }
		});

		if (existing) {
			await db
				.update(systemSettings)
				.set({
					settingValue: allow_manager_delete,
					updatedBy: sessionUser.id
				})
				.where(eq(systemSettings.id, existing.id));
		} else {
			await db.insert(systemSettings).values({
				settingKey: 'allow_manager_delete',
				settingValue: allow_manager_delete,
				updatedBy: sessionUser.id
			});
		}

		await getSettings().refresh();
		return { success: true };
	}
);
