import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getNotifications = query(async () => {
	const { sessionUser } = getSession();

	try {
		// Notifications are linked directly to user, not customer profile
		const result = await db.query.notifications.findMany({
			where: { userId: sessionUser.id },
			// Need to fix orderBy syntax for Drizzle
			orderBy: (notifications, { desc }) => [desc(notifications.createdAt)]
		});

		return {
			notifications: result
		};
	} catch (e) {
		console.error(e);
		return { notifications: [] };
	}
});
