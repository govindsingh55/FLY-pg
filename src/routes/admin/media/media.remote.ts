import { form, getRequestEvent, query } from '$app/server';
import { getMediaType } from '$lib/utils';
import { mediaUpdateSchema } from '$lib/schemas/media';
import { db } from '$lib/server/db';
import { media, propertyMedia, roomMedia } from '$lib/server/db/schema';
import { getStorageProvider } from '$lib/server/storage';
import { error } from '@sveltejs/kit';
import { eq, type InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		console.warn(`[MediaRemote] Unauthorized access attempt to: ${event?.url.pathname}`);
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

// Define explicit types to bypass Drizzle inference complexity
type Media = InferSelectModel<typeof media>;
type MediaWithRelations = Media & {
	propertyMedia: {
		propertyId: string;
		property: { name: string } | null;
	}[];
	roomMedia: {
		roomId: string; // Corrected from mediaId based on error context, but join table has roomId
		room: { number: string } | null;
	}[];
};

export const getMedias = query(
	z.object({
		propertyId: z.string().optional(),
		roomId: z.string().optional()
	}),
	async ({ propertyId, roomId }) => {
		await getSession();

		const results = await db.query.media.findMany({
			with: {
				propertyMedia: {
					with: {
						property: { columns: { name: true } }
					}
				},
				roomMedia: {
					with: {
						room: { columns: { number: true } }
					}
				}
			},
			orderBy: (media, { desc }) => [desc(media.createdAt)]
		});

		// Cast results to our explicit type
		const typedResults = results as unknown as MediaWithRelations[];

		// Filter results in application layer
		const filteredResults = typedResults.filter((m) => {
			if (propertyId) {
				const linked = m.propertyMedia.some((pm) => pm.propertyId === propertyId);
				if (!linked) return false;
			}
			if (roomId) {
				const linked = m.roomMedia.some((rm) => rm.roomId === roomId); // Note: Drizzle relation name usually matches table col? Check schema.
				// In schema: roomMedia relation on media table is defined as 'roomMedia'.
				// roomMedia table has 'roomId' column.
				// Drizzle result for roomMedia relation is array of roomMedia rows.
				// roomMedia row has roomId. Correct.
				if (!linked) return false;
			}
			return true;
		});

		const mappedResults = filteredResults.map((m) => ({
			...m,
			property: m.propertyMedia[0]?.property || null,
			room: m.roomMedia[0]?.room || null
		}));

		return { media: mappedResults };
	}
);

export const uploadMedia = form(
	z.object({
		file: z.any(),
		type: z.enum(['image', 'document', 'video', 'other']).default('image'),
		propertyId: z.string().optional(),
		roomId: z.string().optional()
	}),
	async (payload) => {
		console.log(`[MediaRemote] uploadMedia: payload keys:`, Object.keys(payload));
		console.log(`[MediaRemote] uploadMedia: file type:`, typeof payload.file, payload.file?.constructor?.name, payload.file?.name, payload.file?.size);

		const { sessionUser } = getSession();
		if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
			console.warn(`[MediaRemote] Unauthorized upload attempt: ${sessionUser.id}`);
			throw error(403, 'Forbidden');
		}

		const file = payload.file;
		if (!file || !(file instanceof File) || file.size === 0) {
			console.error(`[MediaRemote] Invalid file received:`, typeof file, file?.constructor?.name, file?.size);
			throw error(400, 'No valid file received');
		}

		const storage = getStorageProvider();
		const url = await storage.upload(file, file.name);

		try {
			const [newMedia] = await db
				.insert(media)
				.values({
					url,
					type: getMediaType(url) === 'video' ? 'video' : payload.type,
					createdAt: new Date()
				})
				.returning();

			console.log(`[MediaRemote] Uploaded ID: ${newMedia.id} (${url})`);

			if (payload.propertyId) {
				await db.insert(propertyMedia).values({
					mediaId: newMedia.id,
					propertyId: payload.propertyId
				});
			}

			if (payload.roomId) {
				await db.insert(roomMedia).values({
					mediaId: newMedia.id,
					roomId: payload.roomId
				});
			}

			return { success: true, media: newMedia };
		} catch (e) {
			console.error(`[MediaRemote] uploadMedia DB error:`, e);
			await storage.delete(url);
			throw error(500, 'Failed to save media record');
		}
	}
);

export const updateMedia = form(mediaUpdateSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		const { id, ...updateData } = data;
		await db
			.update(media)
			.set({
				url: updateData.url,
				type: updateData.type
			})
			.where(eq(media.id, id));

		// Update links
		// For property
		await db.delete(propertyMedia).where(eq(propertyMedia.mediaId, id));
		if (updateData.propertyId) {
			await db.insert(propertyMedia).values({
				mediaId: id,
				propertyId: updateData.propertyId
			});
		}

		// For room
		await db.delete(roomMedia).where(eq(roomMedia.mediaId, id));
		if (updateData.roomId) {
			await db.insert(roomMedia).values({
				mediaId: id,
				roomId: updateData.roomId
			});
		}

		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to update media');
	}
});

export const deleteMedia = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		const mediaItem = await db.query.media.findFirst({
			where: { id }
		});

		if (!mediaItem) {
			throw error(404, 'Media not found');
		}

		const storage = getStorageProvider();
		await storage.delete(mediaItem.url);

		await db.delete(media).where(eq(media.id, id));

		console.log(`[MediaRemote] Deleted media ID: ${id}`);
		return { success: true };
	} catch (e) {
		console.error(`[MediaRemote] deleteMedia error:`, e);
		throw error(500, 'Failed to delete media');
	}
});

export const replaceMedia = form(
	z.object({
		id: z.string(),
		file: z.instanceof(File)
	}),
	async (payload) => {
		const { sessionUser } = getSession();
		if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
			throw error(403, 'Forbidden');
		}

		const mediaItem = await db.query.media.findFirst({
			where: { id: payload.id }
		});

		if (!mediaItem) {
			throw error(404, 'Media record not found');
		}

		const storage = getStorageProvider();
		const file = payload.file;
		const newUrl = await storage.upload(file, file.name);

		try {
			await db
				.update(media)
				.set({
					url: newUrl,
					type: getMediaType(newUrl) === 'video' ? 'video' : 'image'
				})
				.where(eq(media.id, payload.id));

			await storage.delete(mediaItem.url);

			console.log(`[MediaRemote] Replaced ID: ${payload.id} -> ${newUrl}`);
			return { success: true };
		} catch (e) {
			console.error(`[MediaRemote] replaceMedia error:`, e);
			await storage.delete(newUrl);
			throw error(500, 'Failed to update media record');
		}
	}
);
