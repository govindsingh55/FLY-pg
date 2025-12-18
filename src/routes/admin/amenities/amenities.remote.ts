import { db } from '$lib/server/db';
import { command, form, query, getRequestEvent } from '$app/server';
import { amenities } from '$lib/server/db/schema';
import { amenitySchema } from '$lib/schemas/amenity';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { sessionUser: event.locals.user };
};

export const getAmenities = query(
	z.object({
		searchTerm: z.string().optional(),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, page, pageSize }) => {
		getSession();

		const searchFilter = searchTerm
			? {
					OR: [{ name: { like: `%${searchTerm}%` } }, { description: { like: `%${searchTerm}%` } }]
				}
			: {};

		// Get total count by fetching IDs
		const allAmenities = await db.query.amenities.findMany({
			where: searchFilter,
			columns: { id: true }
		});
		const total = allAmenities.length;

		const result = await db.query.amenities.findMany({
			where: searchFilter,
			limit: pageSize,
			offset: (page - 1) * pageSize,
			orderBy: {
				createdAt: 'desc'
			}
		});

		return {
			amenities: result,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize)
		};
	}
);

export const createAmenity = form(amenitySchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db.insert(amenities).values({
			id: crypto.randomUUID(),
			name: data.name,
			description: data.description ?? null,
			image: data.image ?? null,
			icon: data.icon ?? null
		});
		await getAmenities({}).refresh();
		return { success: true };
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		console.error(e);
		throw error(500, `Failed to create amenity: ${msg}`);
	}
});

export const updateAmenity = form(amenitySchema.extend({ id: z.string() }), async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	const { id, ...rest } = data;

	try {
		await db
			.update(amenities)
			.set({
				name: rest.name,
				description: rest.description ?? null,
				image: rest.image ?? null,
				icon: rest.icon ?? null
			})
			.where(eq(amenities.id, id));
		await getAmenities({}).refresh();
		return { success: true };
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error';
		console.error(e);
		throw error(500, `Failed to update amenity: ${msg}`);
	}
});

export const deleteAmenity = command(
	z.object({
		id: z.string(),
		filterProps: z
			.object({
				searchTerm: z.string().optional(),
				page: z.number().optional(),
				pageSize: z.number().optional()
			})
			.optional()
	}),
	async ({ id, filterProps }) => {
		const { sessionUser } = getSession();
		if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
			throw error(403, 'Forbidden');
		}

		try {
			await db.delete(amenities).where(eq(amenities.id, id));
			await getAmenities({ ...filterProps }).refresh();
			return { success: true };
		} catch (e: unknown) {
			const msg = e instanceof Error ? e.message : 'Unknown error';
			console.error(e);
			throw error(500, `Failed to delete amenity: ${msg}`);
		}
	}
);
