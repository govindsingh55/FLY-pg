import { form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { notifications } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

const sendNotificationSchema = z.object({
	recipientIds: z.array(z.string()).min(1, 'At least one recipient is required'),
	title: z.string().optional(),
	message: z.string().min(1, 'Message is required'),
	type: z
		.enum(['info', 'warning', 'success', 'error', 'rent', 'electricity', 'general'])
		.default('info')
});

export const sendNotification = form(
	sendNotificationSchema,
	async ({ recipientIds, title, message, type }) => {
		const { sessionUser } = getSession();

		if (
			sessionUser.role !== 'admin' &&
			sessionUser.role !== 'manager' &&
			sessionUser.role !== 'property_manager'
		) {
			throw error(403, 'Forbidden');
		}

		try {
			await db.insert(notifications).values(
				recipientIds.map((userId) => ({
					userId,
					senderId: sessionUser.id,
					title,
					message,
					type,
					isRead: false
				}))
			);
			return { success: true };
		} catch (e) {
			console.error(e);
			throw error(500, 'Failed to send notifications');
		}
	}
);

export const getNotifications = query(
	z.object({
		limit: z.number().default(20),
		offset: z.number().default(0),
		filter: z.enum(['received', 'sent']).default('received')
	}),
	async ({ limit, offset, filter }) => {
		const { sessionUser } = getSession();

		const result = await db.query.notifications.findMany({
			where: {
				AND: [
					filter === 'received' ? { userId: sessionUser.id } : { senderId: sessionUser.id },
					{ isRead: false }
				]
			},
			with: {
				sender: true,
				user: true // Recipient
			},
			orderBy: {
				createdAt: 'desc'
			},
			limit,
			offset
		});

		return { notifications: result };
	}
);

export const markAsRead = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'customer') {
		return error(403, 'Forbidden');
	}
	await db
		.update(notifications)
		.set({ isRead: true })
		.where(and(eq(notifications.id, id), eq(notifications.userId, sessionUser.id)));
	return { success: true };
});

export const markAllAsRead = form(z.object({}), async () => {
	const { sessionUser } = getSession();
	await db
		.update(notifications)
		.set({ isRead: true })
		.where(eq(notifications.userId, sessionUser.id));
	return { success: true };
});
