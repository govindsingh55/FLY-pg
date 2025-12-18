import { form, getRequestEvent, query } from '$app/server';
import { mediaUpdateSchema } from '$lib/schemas/media';
import { db } from '$lib/server/db';
import { media } from '$lib/server/db/schema';
import { getStorageProvider } from '$lib/server/storage';
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

export const getMedias = query(
	z.object({
		propertyId: z.string().optional(),
		roomId: z.string().optional()
	}),
	async ({ propertyId, roomId }) => {
		await getSession();

		const results = await db.query.media.findMany({
			where: {
				AND: [propertyId ? { propertyId } : {}, roomId ? { roomId } : {}]
			},
			with: {
				property: { columns: { name: true } },
				room: { columns: { number: true } }
			},
			orderBy: { createdAt: 'desc' }
		});

		return { media: results };
	}
);

export const uploadMedia = form(
	z.object({
		file: z.instanceof(File),
		type: z.enum(['image', 'document', 'video', 'other']).default('image'),
		propertyId: z.string().optional(),
		roomId: z.string().optional()
	}),
	async (payload) => {
		const { sessionUser } = getSession();
		if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
			throw error(403, 'Forbidden');
		}

		const file = payload.file;

		const storage = getStorageProvider();
		const url = await storage.upload(file, file.name);

		try {
			const [newMedia] = await db
				.insert(media)
				.values({
					url,
					type: payload.type,
					propertyId: payload.propertyId || null,
					roomId: payload.roomId || null,
					createdAt: new Date(),
					updatedAt: new Date()
				})
				.returning();

			return { success: true, media: newMedia };
		} catch (e) {
			console.error(e);
			// Cleanup uploaded file if DB fails
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
				type: updateData.type,
				propertyId: updateData.propertyId || null,
				roomId: updateData.roomId || null,
				updatedAt: new Date()
			})
			.where(eq(media.id, id));

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

		if (mediaItem) {
			const storage = getStorageProvider();
			await storage.delete(mediaItem.url);

			await db.delete(media).where(eq(media.id, id));
		}

		return { success: true };
	} catch (e) {
		console.error(e);
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

		const file = payload.file;

		const mediaItem = await db.query.media.findFirst({
			where: { id: payload.id }
		});

		if (!mediaItem) {
			throw error(404, 'Media record not found');
		}

		const storage = getStorageProvider();

		// Upload new file
		const newUrl = await storage.upload(file, file.name);

		try {
			// Update DB record
			await db
				.update(media)
				.set({
					url: newUrl,
					updatedAt: new Date()
				})
				.where(eq(media.id, payload.id));

			// Delete old file
			await storage.delete(mediaItem.url);

			return { success: true };
		} catch (e) {
			console.error(e);
			// Cleanup the newly uploaded file if DB update fails
			await storage.delete(newUrl);
			throw error(500, 'Failed to update media record');
		}
	}
);
