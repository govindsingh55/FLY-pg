import { form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { propertyManagerAssignments, staffAssignments } from '$lib/server/db/schema';
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

export const getAssignmentsData = query(async () => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

	try {
		// Fetch Property Managers
		const managersList = await db.query.user.findMany({
			where: (t, { and, eq, isNull }) => and(eq(t.role, 'property_manager'), isNull(t.deletedAt)),
			with: {
				propertyManagerAssignments: {
					with: { property: true }
				}
			}
		});

		// Fetch Staff
		const staffList = await db.query.staffProfiles.findMany({
			where: (t, { isNull }) => isNull(t.deletedAt),
			with: {
				user: true,
				assignments: {
					with: { property: true }
				}
			}
		});

		// Fetch Properties
		const propertiesList = await db.query.properties.findMany({
			where: (t, { isNull }) => isNull(t.deletedAt)
		});

		return {
			managers: managersList.map((m) => ({
				id: m.id,
				name: m.name,
				email: m.email,
				assignments: m.propertyManagerAssignments.map((a) => ({
					id: a.id,
					propertyId: a.propertyId, // for deletion
					propertyName: a.property?.name
				}))
			})),
			staff: staffList.map((s) => ({
				id: s.id, // Profile ID
				userId: s.userId,
				name: s.user?.name ?? 'Unknown',
				staffType: s.staffType,
				assignments: s.assignments.map((a) => ({
					id: a.id,
					propertyId: a.propertyId,
					propertyName: a.property?.name
				}))
			})),
			properties: propertiesList
		};
	} catch (e) {
		console.error(e);
		return { managers: [], staff: [], properties: [] };
	}
});

export const assignManager = form(
	z.object({ userId: z.string(), propertyId: z.string() }),
	async ({ userId, propertyId }) => {
		const { sessionUser } = getSession();
		if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

		const exists = await db.query.propertyManagerAssignments.findFirst({
			where: (t, { and, eq }) => and(eq(t.userId, userId), eq(t.propertyId, propertyId))
		});

		if (exists) throw error(400, 'Already assigned');

		await db.insert(propertyManagerAssignments).values({
			userId,
			propertyId,
			assignedBy: sessionUser.id
		});

		await getAssignmentsData().refresh();
		return { success: true };
	}
);

export const unassignManager = form(
	z.object({ assignmentId: z.string() }),
	async ({ assignmentId }) => {
		const { sessionUser } = getSession();
		if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

		await db
			.delete(propertyManagerAssignments)
			.where(eq(propertyManagerAssignments.id, assignmentId));

		await getAssignmentsData().refresh();
		return { success: true };
	}
);

export const assignStaff = form(
	z.object({ staffProfileId: z.string(), propertyId: z.string() }),
	async ({ staffProfileId, propertyId }) => {
		const { sessionUser } = getSession();
		if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

		const exists = await db.query.staffAssignments.findFirst({
			where: (t, { and, eq }) =>
				and(eq(t.staffProfileId, staffProfileId), eq(t.propertyId, propertyId))
		});

		if (exists) throw error(400, 'Already assigned');

		await db.insert(staffAssignments).values({
			staffProfileId,
			propertyId,
			assignedBy: sessionUser.id
		});

		await getAssignmentsData().refresh();
		return { success: true };
	}
);

export const unassignStaff = form(
	z.object({ assignmentId: z.string() }),
	async ({ assignmentId }) => {
		const { sessionUser } = getSession();
		if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

		await db.delete(staffAssignments).where(eq(staffAssignments.id, assignmentId));

		await getAssignmentsData().refresh();
		return { success: true };
	}
);
