import { db } from '$lib/server/db';
import { systemSettings } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ locals }) => {
	const session = locals.session;
	const user = locals.user;
	if (!session || !user || user.role !== 'admin') {
		throw redirect(302, '/login');
	}

	const settings = await db.query.systemSettings.findMany();

	// Transform to key-value map for easier UI consumption
	const settingsMap: Record<string, unknown> = {};
	settings.forEach((s) => {
		settingsMap[s.settingKey] = s.settingValue;
	});

	return { settings: settingsMap };
};

export const actions = {
	update: async ({ request, locals }) => {
		const session = locals.session;
		const user = locals.user;
		if (!session || !user || user.role !== 'admin') return fail(401);

		const data = await request.formData();
		const allowManagerDelete = data.has('allow_manager_delete');

		// Upsert setting
		const existing = await db.query.systemSettings.findFirst({
			where: {
				settingKey: 'allow_manager_delete'
			}
		});

		if (existing) {
			await db
				.update(systemSettings)
				.set({
					settingValue: allowManagerDelete,
					updatedBy: user.id
				})
				.where(eq(systemSettings.id, existing.id));
		} else {
			await db.insert(systemSettings).values({
				settingKey: 'allow_manager_delete',
				settingValue: allowManagerDelete,
				updatedBy: user.id
			});
		}

		return { success: true };
	}
};
