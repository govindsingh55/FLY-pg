import { form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { visitBookings } from '$lib/server/db/schema';
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

export const getVisits = query(
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
			// Prepare arrays of IDs for filtering if needed
			let allowedPropertyIds: string[] | null = null; // null means all filtered (or none? logic below)

			if (sessionUser.role === 'property_manager') {
				const assignments = await db.query.propertyManagerAssignments.findMany({
					where: { userId: sessionUser.id },
					columns: { propertyId: true }
				});
				allowedPropertyIds = assignments.map((a) => a.propertyId);
				if (allowedPropertyIds.length === 0)
					return { visits: [], total: 0, page, pageSize, totalPages: 0 };
			}
			if (sessionUser.role === 'staff') {
				const staffProfile = await db.query.staffProfiles.findFirst({
					where: { userId: sessionUser.id },
					with: { assignments: true }
				});
				if (!staffProfile || staffProfile.assignments.length === 0)
					return { visits: [], total: 0, page, pageSize, totalPages: 0 };
				allowedPropertyIds = staffProfile.assignments.map((a) => a.propertyId);
			}

			// Get total count
			const resultsList = await db.query.visitBookings.findMany({
				where: {
					deletedAt: { isNull: true },
					...(sessionUser.role === 'admin'
						? {}
						: { propertyId: { in: allowedPropertyIds as string[] } }),
					...(searchTerm
						? {
								OR: [
									{ property: { name: { like: `%${searchTerm}%` } } },
									{ customer: { name: { like: `%${searchTerm}%` } } }
								]
							}
						: {}),
					...(dateFrom ? { visitDate: { gte: new Date(dateFrom) } } : {}),
					...(dateTo ? { visitDate: { lte: new Date(dateTo) } } : {})
				},
				columns: { id: true }
			});

			// Get paginated results
			const offset = (page - 1) * pageSize;
			const visits = await db.query.visitBookings.findMany({
				where: {
					deletedAt: { isNull: true },
					...(sessionUser.role === 'admin'
						? {}
						: { propertyId: { in: allowedPropertyIds as string[] } }),
					...(searchTerm
						? {
								OR: [
									{ property: { name: { like: `%${searchTerm}%` } } },
									{ customer: { name: { like: `%${searchTerm}%` } } }
								]
							}
						: {}),
					...(dateFrom ? { visitDate: { gte: new Date(dateFrom) } } : {}),
					...(dateTo ? { visitDate: { lte: new Date(dateTo) } } : {})
				},
				with: {
					property: true,
					customer: true
				},
				orderBy: {
					visitDate: 'desc'
				},
				limit: pageSize,
				offset: offset
			});

			return {
				visits,
				total: resultsList.length,
				page,
				pageSize,
				totalPages: Math.ceil(resultsList.length / pageSize)
			};
		} catch (e) {
			console.error(e);
			return { visits: [], total: 0, page, pageSize, totalPages: 0 };
		}
	}
);

export const updateVisitStatus = form(
	z.object({
		visitId: z.string(),
		status: z.enum(['pending', 'accepted', 'cancelled'])
	}),
	async ({ visitId, status }) => {
		const { sessionUser } = getSession();
		if (
			sessionUser.role !== 'admin' &&
			sessionUser.role !== 'manager' &&
			sessionUser.role !== 'property_manager'
		) {
			throw error(403, 'Forbidden');
		}

		await db.update(visitBookings).set({ status }).where(eq(visitBookings.id, visitId));
		await getVisits({}).refresh();
		return { success: true };
	}
);

export const deleteVisit = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	await db.update(visitBookings).set(softDelete(sessionUser.id)).where(eq(visitBookings.id, id));
	await getVisits({}).refresh();
	return { success: true };
});
