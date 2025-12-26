import { command, form, getRequestEvent, query } from '$app/server';
import { getMediaType } from '$lib/utils';
import { propertySchema } from '$lib/schemas/property';
import { db } from '$lib/server/db';
import { properties, propertyAmenities, media, propertyMedia } from '$lib/server/db/schema';
import { softDelete } from '$lib/server/db/soft-delete';
import { error } from '@sveltejs/kit';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

const getSession = async () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getProperties = query(
	z.object({
		searchTerm: z.string().optional(),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, page, pageSize }) => {
		const { sessionUser } = await getSession();

		try {
			// Prepare arrays of IDs for filtering if needed
			let allowedPropertyIds: string[] | null = null; // null means all filtered by role (admin has access to all)

			if (sessionUser.role === 'property_manager') {
				const assignments = await db.query.propertyManagerAssignments.findMany({
					where: { userId: sessionUser.id },
					columns: { propertyId: true }
				});
				allowedPropertyIds = assignments.map((a) => a.propertyId);
				if (allowedPropertyIds.length === 0)
					return { properties: [], total: 0, page, pageSize, totalPages: 0 };
			} else if (sessionUser.role === 'staff') {
				const staffProfile = await db.query.staffProfiles.findFirst({
					where: { userId: sessionUser.id },
					with: { assignments: true }
				});
				if (staffProfile && staffProfile.assignments.length > 0) {
					allowedPropertyIds = staffProfile.assignments.map((a) => a.propertyId);
				} else {
					return { properties: [], total: 0, page, pageSize, totalPages: 0 };
				}
			}

			const roleFilter =
				sessionUser.role === 'admin' || sessionUser.role === 'manager'
					? {}
					: {
							id: { in: allowedPropertyIds as string[] }
						};

			const searchFilter = searchTerm
				? {
						OR: [
							{ name: { like: `%${searchTerm}%` } },
							{ description: { like: `%${searchTerm}%` } },
							{ sector: { like: `%${searchTerm}%` } },
							{ city: { like: `%${searchTerm}%` } }
						]
					}
				: {};

			// Get total count
			const propertiesList = await db.query.properties.findMany({
				where: {
					deletedAt: { isNull: true },
					...roleFilter,
					...searchFilter
				},
				columns: { id: true } // Subset for count
			});

			// Get paginated results
			const offset = (page - 1) * pageSize;
			const props = await db.query.properties.findMany({
				where: {
					deletedAt: { isNull: true },
					...roleFilter,
					...searchFilter
				},
				with: {
					rooms: true,
					propertyMedia: {
						with: {
							media: true
						}
					}
				},
				orderBy: { createdAt: 'desc' },
				limit: pageSize,
				offset: offset
			});

			// Transform to flatten media
			const mappedProps = props.map((p) => ({
				...p,
				media: p.propertyMedia
					.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
					.map((pm) => ({
						url: pm.media!.url,
						type: pm.media!.type as 'image' | 'video'
					}))
			}));

			return {
				properties: mappedProps,
				total: propertiesList.length,
				page,
				pageSize,
				totalPages: Math.ceil(propertiesList.length / pageSize)
			};
		} catch (e) {
			console.error(e);
			return { properties: [], total: 0, page, pageSize, totalPages: 0 };
		}
	}
);

export const getProperty = query(z.string(), async (id) => {
	await getSession();
	try {
		const property = await db.query.properties.findFirst({
			where: {
				id,
				deletedAt: { isNull: true }
			},
			with: {
				rooms: {
					with: {
						roomMedia: {
							with: {
								media: true
							}
						}
					}
				},
				amenities: true,
				propertyMedia: {
					with: {
						media: true
					}
				}
			}
		});

		if (!property) throw error(404, 'Property not found');

		const flattenedProperty = {
			...property,
			rooms: property.rooms
				.filter((room) => !room.deletedAt)
				.map((room) => ({
					...room,
					media: room.roomMedia.map((rm) => ({
						url: rm.media!.url,
						type: rm.media!.type as 'image' | 'video'
					}))
				})),
			media: property.propertyMedia
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
				.map((pm) => ({
					url: pm.media!.url,
					type: pm.media!.type as 'image' | 'video'
				}))
		};

		return { property: flattenedProperty };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to fetch property');
	}
});

export const createProperty = form(propertySchema, async (data) => {
	const { sessionUser } = await getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		const { amenities: amenityIds, media: mediaFiles, ...propData } = data;

		// 1. Create Property
		const propertyId = crypto.randomUUID();
		await db.insert(properties).values({
			id: propertyId,
			...propData
		});

		// 2. Add Amenities
		if (amenityIds && amenityIds.length > 0) {
			const links = amenityIds.map((aid: string) => ({
				propertyId,
				amenityId: aid
			}));
			await db.insert(propertyAmenities).values(links);
		}

		// 3. Add Images (Media)
		// 3. Add Media
		if (mediaFiles && mediaFiles.length > 0) {
			for (const m of mediaFiles) {
				const mId = crypto.randomUUID();
				await db.insert(media).values({
					id: mId,
					url: m,
					type: getMediaType(m)
				});
				await db.insert(propertyMedia).values({
					propertyId,
					mediaId: mId,
					isFeatured: mediaFiles.indexOf(m) === 0,
					order: mediaFiles.indexOf(m)
				});
			}
		}

		await getProperties({}).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to create property');
	}
});

const updateSchema = propertySchema.extend({
	id: z.string(),
	// Robust handling for FormData (comma-separated strings, empty values, 'on' checkboxes)
	media: z
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
		.default([]),
	amenities: z
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
		.optional(),
	isFoodServiceAvailable: z
		.union([z.boolean(), z.literal('on'), z.literal('true'), z.literal('false')])
		.transform((val) => val === true || val === 'on' || val === 'true')
		.optional()
		.default(false),
	lat: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => (val === '' || val === undefined ? undefined : Number(val))),
	lng: z
		.union([z.string(), z.number()])
		.optional()
		.transform((val) => (val === '' || val === undefined ? undefined : Number(val)))
});

export const updateProperty = form(updateSchema, async (data) => {
	const { sessionUser } = await getSession();
	console.log({ sessionUser, data });
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		const { amenities, media: mediaFilesRaw, id: rawId, ...propData } = data;
		const id = rawId as string;
		const mediaFiles = mediaFilesRaw as string[];
		const amenityIds = amenities as string[];

		console.log({ propData, mediaFiles, amenityIds });
		// 1. Update Property
		await db
			.update(properties)
			.set({
				...propData,
				updatedAt: new Date()
			})
			.where(eq(properties.id, id));

		// 2. Update Amenities (Delete all, re-insert)
		await db.delete(propertyAmenities).where(eq(propertyAmenities.propertyId, id));
		if (amenityIds && amenityIds.length > 0) {
			const links = amenityIds.map((aid: string) => ({
				propertyId: id,
				amenityId: aid
			}));
			await db.insert(propertyAmenities).values(links);
		}

		// (Assume mediaFiles is array of strings from schema transform)
		const targetMediaUrls = mediaFiles || [];

		// Get existing property-media links (only need to check IDs if selective)
		// But since we are replacing all links, we don't strictly need this query unless we wanted to cleanup orphaned Media usage elsewhere.
		// For now, removing unused read.

		const incomingMediaIds: string[] = [];

		if (targetMediaUrls.length > 0) {
			// Query media table to get IDs for the incoming URLs
			const mediaRecords = await db.select().from(media).where(inArray(media.url, targetMediaUrls));
			const mediaUrlToIdMap = new Map(mediaRecords.map((m) => [m.url, m.id]));

			for (const url of targetMediaUrls) {
				let id = mediaUrlToIdMap.get(url);
				if (!id) {
					// Create new media record if it doesn't exist
					id = crypto.randomUUID();
					await db.insert(media).values({
						id,
						url,
						type: getMediaType(url)
					});
					// Update local map to avoid creating duplicates for same URL if passed twice
					mediaUrlToIdMap.set(url, id);
				}
				incomingMediaIds.push(id);
			}
		}

		// Deduplicate incoming IDs
		const uniqueIncomingMediaIds = [...new Set(incomingMediaIds)];

		// 3. Re-sync Property Media Links (Delete All & Insert All to preserve order)
		await db.delete(propertyMedia).where(eq(propertyMedia.propertyId, id));

		if (uniqueIncomingMediaIds.length > 0) {
			const newLinks = uniqueIncomingMediaIds.map((mediaId, index) => ({
				propertyId: id,
				mediaId,
				isFeatured: index === 0,
				order: index
			}));
			await db.insert(propertyMedia).values(newLinks);
		}

		// Note: We don't delete orphaned media from the 'media' table here.
		// Media should only be deleted via /admin/media management interface.

		await getProperties({}).refresh();
		await getProperty(data.id as string).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to update property');
	}
});

export const deleteProperty = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = await getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db.update(properties).set(softDelete(sessionUser.id)).where(eq(properties.id, id));

		await getProperties({}).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to delete property');
	}
});

export const updatePropertyStatus = command(
	z.object({
		id: z.string(),
		status: z.enum(['draft', 'published']),
		filterProps: z
			.object({
				searchTerm: z.string().optional(),
				page: z.number().optional(),
				pageSize: z.number().optional()
			})
			.optional()
	}),
	async ({ id, status, filterProps }) => {
		const { sessionUser } = await getSession();
		if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
			throw error(403, 'Forbidden');
		}

		try {
			await db
				.update(properties)
				.set({
					status,
					updatedAt: new Date()
				})
				.where(eq(properties.id, id));

			await getProperties({ ...filterProps }).refresh();
			return { success: true };
		} catch (e) {
			console.error(e);
			throw error(500, 'Failed to update property status');
		}
	}
);
