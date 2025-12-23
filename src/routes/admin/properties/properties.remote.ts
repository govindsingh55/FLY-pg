import { command, form, getRequestEvent, query } from '$app/server';
import { propertySchema } from '$lib/schemas/property';
import { db } from '$lib/server/db';
import { properties, propertyAmenities, media, propertyMedia } from '$lib/server/db/schema';
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

export const getProperties = query(
	z.object({
		searchTerm: z.string().optional(),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, page, pageSize }) => {
		const { sessionUser } = getSession();

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
				media: p.propertyMedia.map((pm) => ({
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
				rooms: true,
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
			media: property.propertyMedia.map((pm) => ({
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
	const { sessionUser } = getSession();
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
					url: m.url,
					type: m.type
				});
				await db.insert(propertyMedia).values({
					propertyId,
					mediaId: mId,
					isFeatured: false // Default
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
	id: z.string()
});

export const updateProperty = form(updateSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		const { amenities: amenityIds, media: mediaFiles, id, ...propData } = data;

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

		// 3. Update Media
		// 3. Update Media (Directly in main update)
		// 3. Update Media (Delete existing links and re-create)
		await db.delete(propertyMedia).where(eq(propertyMedia.propertyId, id));
		// Note: orphan media records in 'media' table are not cleaned up here.
		// Ideally we should find them and delete them if not used elsewhere, or use a periodic cleanup job.

		if (mediaFiles && mediaFiles.length > 0) {
			for (const m of mediaFiles) {
				// We create NEW media records because we don't know if the URL changed or if it's a new file.
				// A more optimized approach would be to check if URL exists.
				const mId = crypto.randomUUID();
				await db.insert(media).values({
					id: mId,
					url: m.url,
					type: m.type
				});
				await db.insert(propertyMedia).values({
					propertyId: id,
					mediaId: mId
				});
			}
		}

		await getProperties({}).refresh();
		await getProperty(data.id).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to update property');
	}
});

export const deleteProperty = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
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
		const { sessionUser } = getSession();
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
