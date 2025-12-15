import { db } from '$lib/server/db';
import { bookings, propertyManagerAssignments, staffProfiles } from '$lib/server/db/schema';
import { notDeletedFilter } from '$lib/server/db/soft-delete';
import { eq, inArray, and, desc } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const session = await locals.auth();
	if (!session) throw redirect(302, '/login');

	try {
		let result = [];

		if (session.user.role === 'admin' || session.user.role === 'manager') {
			result = await db.query.bookings.findMany({
				where: notDeletedFilter(bookings),
				with: {
					property: true,
					room: true,
					customer: true
				},
				orderBy: [desc(bookings.createdAt)]
			});
		} else if (session.user.role === 'property_manager') {
			const assignments = await db.query.propertyManagerAssignments.findMany({
				where: eq(propertyManagerAssignments.userId, session.user.id),
				columns: { propertyId: true }
			});
			const ids = assignments.map((a) => a.propertyId);
			if (ids.length > 0) {
				result = await db.query.bookings.findMany({
					where: and(inArray(bookings.propertyId, ids), notDeletedFilter(bookings)),
					with: {
						property: true,
						room: true,
						customer: true
					},
					orderBy: [desc(bookings.createdAt)]
				});
			}
		} else if (session.user.role === 'staff') {
			const staffProfile = await db.query.staffProfiles.findFirst({
				where: eq(staffProfiles.userId, session.user.id),
				with: { assignments: true }
			});
			if (staffProfile && staffProfile.assignments.length > 0) {
				const ids = staffProfile.assignments.map((a) => a.propertyId);
				result = await db.query.bookings.findMany({
					where: and(inArray(bookings.propertyId, ids), notDeletedFilter(bookings)),
					with: {
						property: true,
						room: true,
						customer: true
					},
					orderBy: [desc(bookings.createdAt)]
				});
			}
		}

		return {
			bookings: result
		};
	} catch (e) {
		console.error(e);
		return { bookings: [] };
	}
};
