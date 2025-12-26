import { form, getRequestEvent, query } from '$app/server';
import { getMediaType } from '$lib/utils';
import { roomSchema } from '$lib/schemas/room';
import { db } from '$lib/server/db';
import { media as mediaTable, roomMedia, rooms } from '$lib/server/db/schema';
import { softDelete } from '$lib/server/db/soft-delete';
import { error } from '@sveltejs/kit';
import { eq, inArray } from 'drizzle-orm';
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
			media: roomData.roomMedia
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
				.map((rm) => ({
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

// Reusable media schema that handles comma-separated string from FormData
const mediaSchema = z
	.union([
		z.string().transform((val) =>
			val
				? val
						.split(',')
						.map((s) => s.trim())
						.filter((s) => s.length > 0)
				: []
		),
		z.array(z.string())
	])
	.optional()
	.default([]);

const createRoomSchema = roomSchema.extend({
	propertyId: z.string(),
	media: mediaSchema
});

export const createRoom = form(createRoomSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		const { media: mediaFilesRaw, ...roomData } = data;
		const mediaUrls = mediaFilesRaw as string[];

		// 1. Create Room
		const roomId = crypto.randomUUID();
		await db.insert(rooms).values({
			id: roomId,
			...roomData,
			features: roomData.features || []
		});

		// 2. Add Media
		if (mediaUrls && mediaUrls.length > 0) {
			const uniqueUrls = [...new Set(mediaUrls)];

			// Reuse existing media or create new
			const existingMedia = await db
				.select()
				.from(mediaTable)
				.where(inArray(mediaTable.url, uniqueUrls));
			const urlToIdMap = new Map(existingMedia.map((m) => [m.url, m.id]));

			for (const url of uniqueUrls) {
				if (!urlToIdMap.has(url)) {
					const newId = crypto.randomUUID();
					await db.insert(mediaTable).values({
						id: newId,
						url,
						type: getMediaType(url)
					});
					urlToIdMap.set(url, newId);
				}
			}

			const links = uniqueUrls.map((url, index) => ({
				roomId,
				mediaId: urlToIdMap.get(url)!,
				isFeatured: index === 0,
				order: index
			}));

			if (links.length > 0) {
				await db.insert(roomMedia).values(links);
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
	propertyId: z.string().optional(), // Usually redundant but might be passed
	media: mediaSchema
});

export const updateRoom = form(updateRoomSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		const { media: mediaFilesRaw, id: rawId, ...roomData } = data;
		const id = rawId as string;
		const targetMediaUrls = (mediaFilesRaw as string[]) || [];

		// 1. Update Room
		await db
			.update(rooms)
			.set({
				...roomData,
				updatedAt: new Date()
			})
			.where(eq(rooms.id, id));

		// 2. Update Media Logic (Mirroring properties.remote.ts)

		// Get existing room-media links
		// const existingRoomMedia = await db.query.roomMedia.findMany({
		// 	where: { roomId: id }
		// });
		// const existingMediaIds = existingRoomMedia.map((rm) => rm.mediaId); // Unused

		const incomingMediaIds: string[] = [];

		if (targetMediaUrls.length > 0) {
			// Find existing media records for these URLs
			const mediaRecords = await db
				.select()
				.from(mediaTable)
				.where(inArray(mediaTable.url, targetMediaUrls));
			const mediaUrlToIdMap = new Map(mediaRecords.map((m) => [m.url, m.id]));

			for (const url of targetMediaUrls) {
				let mId = mediaUrlToIdMap.get(url);
				if (!mId) {
					// Create new media record
					mId = crypto.randomUUID();
					await db.insert(mediaTable).values({
						id: mId,
						url,
						type: getMediaType(url)
					});
					mediaUrlToIdMap.set(url, mId);
				}
				incomingMediaIds.push(mId);
			}
		}

		// Deduplicate incoming IDs
		const uniqueIncomingMediaIds = [...new Set(incomingMediaIds)];

		// 3. Re-sync Room Media Links (Delete All & Insert All)
		await db.delete(roomMedia).where(eq(roomMedia.roomId, id));

		if (uniqueIncomingMediaIds.length > 0) {
			const newLinks = uniqueIncomingMediaIds.map((mediaId, index) => ({
				roomId: id,
				mediaId,
				isFeatured: index === 0,
				order: index
			}));
			await db.insert(roomMedia).values(newLinks);
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
