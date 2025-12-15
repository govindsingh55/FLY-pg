import { db } from '$lib/server/db';
import { properties, propertyManagerAssignments, staffProfiles } from '$lib/server/db/schema';
import { notDeletedFilter } from '$lib/server/db/soft-delete';
import { eq, inArray, and } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const session = await locals.auth();
	if (!session) throw redirect(302, '/login');

	try {
		let props = [];

		if (session.user.role === 'admin' || session.user.role === 'manager') {
			props = await db.query.properties.findMany({
				where: notDeletedFilter(properties),
				with: {
					rooms: true
				}
			});
		} else if (session.user.role === 'property_manager') {
			const assignments = await db.query.propertyManagerAssignments.findMany({
				where: eq(propertyManagerAssignments.userId, session.user.id),
				columns: { propertyId: true }
			});
			const ids = assignments.map((a) => a.propertyId);
			if (ids.length > 0) {
				props = await db.query.properties.findMany({
					where: and(inArray(properties.id, ids), notDeletedFilter(properties)),
					with: { rooms: true }
				});
			}
		} else if (session.user.role === 'staff') {
			const staffProfile = await db.query.staffProfiles.findFirst({
				where: eq(staffProfiles.userId, session.user.id),
				with: { assignments: true }
			});
			if (staffProfile && staffProfile.assignments.length > 0) {
				const ids = staffProfile.assignments.map((a) => a.propertyId);
				props = await db.query.properties.findMany({
					where: and(inArray(properties.id, ids), notDeletedFilter(properties)),
					with: { rooms: true }
				});
			}
		}

		return {
			properties: props
		};
	} catch (e) {
		console.error(e);
		return { properties: [] };
	}
};
