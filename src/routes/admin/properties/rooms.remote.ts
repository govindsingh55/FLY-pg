import { form, getRequestEvent, query } from '$app/server';
import { roomSchema } from '$lib/schemas/room';
import { db } from '$lib/server/db';
import { rooms, media } from '$lib/server/db/schema';
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
			where: { id, deletedAt: { isNull: true } },
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
		const { images: imageUrls, ...roomData } = data;
		const roomId = crypto.randomUUID();

		await db.insert(rooms).values({
			id: roomId,
			...roomData,
			features: roomData.features || []
		});

		if (imageUrls && imageUrls.length > 0) {
			const mediaItems = imageUrls.map((url: string) => ({
				url,
				roomId,
				type: 'image' as const
			}));
			await db.insert(media).values(mediaItems);
		}

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
		const { images: imageUrls, ...roomData } = data;

		await db
			.update(rooms)
			.set({
				number: roomData.number,
				type: roomData.type,
				capacity: roomData.capacity,
				priceMonthly: roomData.priceMonthly,
				depositAmount: roomData.depositAmount,
				status: roomData.status,
				features: roomData.features,
				updatedAt: new Date()
			})
			.where(eq(rooms.id, roomData.id));

		// Update Media
		await db.delete(media).where(eq(media.roomId, roomData.id));
		if (imageUrls && imageUrls.length > 0) {
			const mediaItems = imageUrls.map((url: string) => ({
				url,
				roomId: roomData.id,
				type: 'image' as const
			}));
			await db.insert(media).values(mediaItems);
		}

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
