import { db } from '$lib/server/db';

export const load = async ({ parent }) => {
	const { user } = await parent();

	// Fetch notifications for the user
	// Note: Notifications are linked to 'user' in schema, not 'customer'.
	// "userId: text('user_id').references(() => user.id)"

	try {
		const result = await db.query.notifications.findMany({
			where: { userId: user.id },
			orderBy: { createdAt: 'desc' }
		});

		return {
			notifications: result
		};
	} catch (e) {
		console.error(e);
		return { notifications: [] };
	}
};
