import { db } from '$lib/server/db';
import { propertyManagerAssignments, staffAssignments } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
// import { ensureAdmin } from '$lib/server/auth-utils'; // Assuming we have or use check in load

export const load = async ({ locals }) => {
	const session = locals.session;
	const user = locals.user;
	if (!session || !user || user.role !== 'admin') {
		throw redirect(302, '/login');
	}

	// Fetch Property Managers
	const managersList = await db.query.user.findMany({
		// where: and(eq(user.role, 'property_manager'), notDeletedFilter(user)),
		where: {
			AND: [{ role: 'property_manager' }, { deletedAt: { isNull: true } }]
		},
		with: {
			propertyManagerAssignments: {
				with: { property: true }
			}
		}
	});

	// Fetch Staff
	const staffList = await db.query.staffProfiles.findMany({
		// where: notDeletedFilter(staffProfiles),
		where: {
			AND: [{ deletedAt: { isNull: true } }]
		},
		with: {
			user: true,
			assignments: {
				with: { property: true }
			}
		}
	});

	// Fetch Properties
	const propertiesList = await db.query.properties.findMany({
		where: {
			deletedAt: { isNull: true }
		}
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
};

export const actions = {
	assignManager: async ({ request, locals }) => {
		const session = locals.session;
		const user = locals.user;
		if (!session || !user || user.role !== 'admin') return fail(401);

		const data = await request.formData();
		const userId = data.get('userId') as string;
		const propertyId = data.get('propertyId') as string;

		if (!userId || !propertyId) return fail(400);

		// Check exists
		const exists = await db.query.propertyManagerAssignments.findFirst({
			// where: and(
			// 	eq(propertyManagerAssignments.userId, userId),
			// 	eq(propertyManagerAssignments.propertyId, propertyId)
			// )
			where: {
				AND: [{ userId }, { propertyId }]
			}
		});

		if (exists) return fail(400, { message: 'Already assigned' });

		await db.insert(propertyManagerAssignments).values({
			userId,
			propertyId,
			assignedBy: user.id
		});

		return { success: true };
	},

	unassignManager: async ({ request, locals }) => {
		const session = locals.session;
		const user = locals.user;
		if (!session || !user || user.role !== 'admin') return fail(401);
		const data = await request.formData();
		const assignmentId = data.get('assignmentId') as string;
		if (!assignmentId) return fail(400);

		await db
			.delete(propertyManagerAssignments)
			.where(eq(propertyManagerAssignments.id, assignmentId));
		return { success: true };
	},

	assignStaff: async ({ request, locals }) => {
		const session = locals.session;
		const user = locals.user;
		if (!session || !user || user.role !== 'admin') return fail(401);

		const data = await request.formData();
		const staffProfileId = data.get('staffProfileId') as string;
		const propertyId = data.get('propertyId') as string;

		if (!staffProfileId || !propertyId) return fail(400);

		const exists = await db.query.staffAssignments.findFirst({
			// where: and(
			// 	eq(staffAssignments.staffProfileId, staffProfileId),
			// 	eq(staffAssignments.propertyId, propertyId)
			// )
			where: {
				AND: [{ staffProfileId }, { propertyId }]
			}
		});

		if (exists) return fail(400, { message: 'Already assigned' });

		await db.insert(staffAssignments).values({
			staffProfileId,
			propertyId,
			assignedBy: user.id
		});

		return { success: true };
	},

	unassignStaff: async ({ request, locals }) => {
		const session = locals.session;
		const user = locals.user;
		if (!session || !user || user.role !== 'admin') return fail(401);
		const data = await request.formData();
		const assignmentId = data.get('assignmentId') as string;
		if (!assignmentId) return fail(400);

		await db.delete(staffAssignments).where(eq(staffAssignments.id, assignmentId));
		return { success: true };
	}
};
