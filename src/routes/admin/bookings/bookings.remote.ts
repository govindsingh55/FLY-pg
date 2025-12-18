import { form, getRequestEvent, query } from '$app/server';
import { bookingSchema } from '$lib/schemas/booking';
import { db } from '$lib/server/db';
import { bookings, properties } from '$lib/server/db/schema';
import { softDelete } from '$lib/server/db/soft-delete';
import { error } from '@sveltejs/kit';
import { eq, like } from 'drizzle-orm';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getBookings = query(
	z.object({
		searchTerm: z.string().optional(),
		dateFrom: z.string().optional(),
		dateTo: z.string().optional(),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, dateFrom, dateTo, page, pageSize }) => {
		const { sessionUser } = getSession();

		try {
			let allowedPropertyIds: string[] | null = null;

			if (sessionUser.role === 'property_manager') {
				const assignments = await db.query.propertyManagerAssignments.findMany({
					where: { userId: sessionUser.id },
					columns: { propertyId: true }
				});
				allowedPropertyIds = assignments.map((a) => a.propertyId);
				if (allowedPropertyIds.length === 0)
					return { bookings: [], total: 0, page, pageSize, totalPages: 0 };
			}
			if (sessionUser.role === 'staff') {
				const staffProfile = await db.query.staffProfiles.findFirst({
					where: { userId: sessionUser.id },
					with: { assignments: true }
				});
				if (staffProfile && staffProfile.assignments.length > 0) {
					allowedPropertyIds = staffProfile.assignments.map((a) => a.propertyId);
				} else {
					return { bookings: [], total: 0, page, pageSize, totalPages: 0 };
				}
			}

			let matchedPropertyIds: string[] = [];
			if (searchTerm) {
				const props = await db
					.select({ id: properties.id })
					.from(properties)
					.where(like(properties.name, `%${searchTerm}%`));
				matchedPropertyIds = props.map((p) => p.id);
			}

			// Get total count
			const totalCount = await db.query.bookings.findMany({
				where: {
					AND: [
						{ deletedAt: { isNull: true } },
						sessionUser.role === 'admin' ? {} : { propertyId: { in: allowedPropertyIds || [] } },
						!searchTerm
							? {}
							: {
									OR: [
										{ propertyId: searchTerm },
										{ roomId: searchTerm },
										{ customerId: searchTerm },
										...(matchedPropertyIds.length > 0
											? [{ propertyId: { in: matchedPropertyIds } }]
											: [])
									]
								},
						dateFrom ? { startDate: { gte: new Date(dateFrom) } } : {},
						dateTo ? { startDate: { lte: new Date(dateTo) } } : {}
					]
				}
			});

			// Get paginated results
			const offset = (page - 1) * pageSize;
			const result = await db.query.bookings.findMany({
				where: {
					AND: [
						{ deletedAt: { isNull: true } },
						sessionUser.role === 'admin' ? {} : { propertyId: { in: allowedPropertyIds || [] } },
						!searchTerm
							? {}
							: {
									OR: [
										{ propertyId: searchTerm },
										{ roomId: searchTerm },
										{ customerId: searchTerm },
										...(matchedPropertyIds.length > 0
											? [{ propertyId: { in: matchedPropertyIds } }]
											: [])
									]
								},
						dateFrom ? { startDate: { gte: new Date(dateFrom) } } : {},
						dateTo ? { startDate: { lte: new Date(dateTo) } } : {}
					]
				},
				with: {
					property: true,
					room: true,
					customer: true
				},
				orderBy: (t, { desc }) => [desc(t.createdAt)],
				limit: pageSize,
				offset: offset
			});

			return {
				bookings: result,
				total: totalCount.length,
				page,
				pageSize,
				totalPages: Math.ceil(totalCount.length / pageSize)
			};
		} catch (e) {
			console.error(e);
			return { bookings: [] };
		}
	}
);

export const getBooking = query(z.string(), async (id) => {
	await getSession();
	try {
		const booking = await db.query.bookings.findFirst({
			where: {
				AND: [{ id }, { deletedAt: { isNull: true } }]
			},
			with: {
				property: true,
				room: true,
				customer: true,
				payments: {
					orderBy: (t, { desc }) => [desc(t.createdAt)]
				}
			}
		});

		if (!booking) throw error(404, 'Booking not found');
		return { booking };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to fetch booking');
	}
});

export const cancelBooking = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db
			.update(bookings)
			.set({ status: 'cancelled', updatedAt: new Date() })
			.where(eq(bookings.id, id));

		await getBookings({}).refresh();
		await getBooking(id).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to cancel booking');
	}
});

export const createBooking = form(bookingSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db.insert(bookings).values({
			...data
		});

		await getBookings({}).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to create booking');
	}
});

const updateSchema = bookingSchema.extend({
	id: z.string()
});

export const updateBooking = form(updateSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db
			.update(bookings)
			.set({
				propertyId: data.propertyId,
				roomId: data.roomId,
				customerId: data.customerId,
				startDate: data.startDate,
				endDate: data.endDate,
				rentAmount: data.rentAmount,
				status: data.status,
				updatedAt: new Date()
			})
			.where(eq(bookings.id, data.id));

		await getBookings({}).refresh();
		await getBooking(data.id).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to update booking');
	}
});

export const deleteBooking = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db.update(bookings).set(softDelete(sessionUser.id)).where(eq(bookings.id, id));

		await getBookings({}).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to delete booking');
	}
});
