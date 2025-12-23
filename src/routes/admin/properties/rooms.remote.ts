import { form, getRequestEvent, query } from '$app/server';
import { roomSchema } from '$lib/schemas/room';
import { db } from '$lib/server/db';
import { media, roomMedia, rooms } from '$lib/server/db/schema';
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
		const roomData = await db.query.rooms.findFirst({
			where: { id, deletedAt: { isNull: true } },
			with: {
				property: true,
				roomMedia: {
					with: {
						media: true
					}
				}
			}
		});

		if (!roomData) throw error(404, 'Room not found');

		const mappedRoom = {
			...roomData,
			media: roomData.roomMedia.map((rm) => ({
				url: rm.media!.url,
				type: rm.media!.type as 'image' | 'video'
			}))
		};

		return { room: mappedRoom };
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
		const { media: mediaFiles, ...roomData } = data;

		// 1. Create Room
		const roomId = crypto.randomUUID();
		await db.insert(rooms).values({
			id: roomId,
			...roomData,
			features: roomData.features || []
		});

		// 2. Add Media
		if (mediaFiles && mediaFiles.length > 0) {
			for (const m of mediaFiles) {
				const mId = crypto.randomUUID();
				await db.insert(media).values({
					id: mId,
					url: m.url,
					type: m.type
				});
				await db.insert(roomMedia).values({
					roomId,
					mediaId: mId
				});
			}
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
		const { media: mediaFiles, id, ...roomData } = data;

		// 1. Update Room
		await db
			.update(rooms)
			.set({
				...roomData,
				updatedAt: new Date()
			})
			.where(eq(rooms.id, id));

		// 2. Update Media
		await db.delete(roomMedia).where(eq(roomMedia.roomId, id));
		if (mediaFiles && mediaFiles.length > 0) {
			for (const m of mediaFiles) {
				const mId = crypto.randomUUID();
				await db.insert(media).values({
					id: mId,
					url: m.url,
					type: m.type
				});
				await db.insert(roomMedia).values({
					roomId: id,
					mediaId: mId
				});
			}
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
