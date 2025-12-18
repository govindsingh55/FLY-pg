import { form, getRequestEvent, query } from '$app/server';
import { roomSchema } from '$lib/schemas/room';
import { db } from '$lib/server/db';
import { rooms } from '$lib/server/db/schema';
import { softDelete } from '$lib/server/db/soft-delete';
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

export const getRoom = query(z.string(), async (id) => {
	await getSession();
	try {
		// Use callback syntax
		const room = await db.query.rooms.findFirst({
			where: {
				AND: [{ id: id }, { deletedAt: { isNull: true } }]
			},
			with: {
				property: true
			}
		});

		if (!room) throw error(404, 'Room not found');
		return { room };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to fetch room');
	}
});

const createRoomSchema = roomSchema.extend({
	propertyId: z.string()
});

export const createRoom = form(createRoomSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db.insert(rooms).values({
			...data,
			features: data.features || []
		});

		// Refresh property details if needed?
		// We can't easily refresh getProperty(id) from here without knowing how it was called,
		// but typically client invalidates.
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to create room');
	}
});

const updateRoomSchema = roomSchema.extend({
	id: z.string(),
	propertyId: z.string().optional() // Usually redundant but might be passed
});

export const updateRoom = form(updateRoomSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db
			.update(rooms)
			.set({
				number: data.number,
				type: data.type,
				capacity: data.capacity,
				priceMonthly: data.priceMonthly,
				depositAmount: data.depositAmount,
				status: data.status,
				features: data.features,
				updatedAt: new Date()
			})
			.where(eq(rooms.id, data.id));

		await getRoom(data.id).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to update room');
	}
});

export const deleteRoom = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db.update(rooms).set(softDelete(sessionUser.id)).where(eq(rooms.id, id));
		// Logic to refresh property?
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to delete room');
	}
});
