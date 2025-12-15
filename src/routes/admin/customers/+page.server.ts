import { db } from '$lib/server/db';
import { customers, user as userSchema } from '$lib/server/db/schema';
import { redirect } from '@sveltejs/kit';
import type { InferSelectModel } from 'drizzle-orm';

type Customer = InferSelectModel<typeof customers> & {
	user: InferSelectModel<typeof userSchema> | null;
};

export const load = async ({ locals }) => {
	const session = locals.session;
	const user = locals.user;
	if (!session || !user) throw redirect(302, '/login');

	try {
		let result: Customer[] = [];
		let allowedCustomerIds: string[] | null = null; // null means all (Admin/Manager)

		if (user.role === 'admin' || user.role === 'manager') {
			allowedCustomerIds = null;
		} else if (user.role === 'property_manager' || user.role === 'staff') {
			// Find assigned properties
			let assignedProperties: string[] = [];

			if (user.role === 'property_manager') {
				const assigns = await db.query.propertyManagerAssignments.findMany({
					// where: eq(propertyManagerAssignments.userId, user.id),
					where: {
						userId: user.id
					},
					columns: { propertyId: true }
				});
				assignedProperties = assigns.map((a) => a.propertyId);
			} else {
				const profile = await db.query.staffProfiles.findFirst({
					// where: eq(staffProfiles.userId, user.id),
					where: {
						userId: user.id
					},
					with: { assignments: true }
				});
				if (profile) {
					assignedProperties = profile.assignments.map((a) => a.propertyId);
				}
			}

			if (assignedProperties.length > 0) {
				// Find customers with bookings or visits in these properties
				const relatedBookings = await db.query.bookings.findMany({
					// where: inArray(bookings.propertyId, assignedProperties),
					where: {
						propertyId: { in: assignedProperties }
					},
					columns: { customerId: true }
				});
				const relatedVisits = await db.query.visitBookings.findMany({
					// where: inArray(visitBookings.propertyId, assignedProperties),
					where: {
						propertyId: { in: assignedProperties }
					},
					columns: { customerId: true }
				});

				const ids = new Set([
					...relatedBookings.map((b) => b.customerId),
					...relatedVisits.map((v) => v.customerId)
				]);
				allowedCustomerIds = Array.from(ids);
			} else {
				allowedCustomerIds = [];
			}
		}

		if (allowedCustomerIds !== null && allowedCustomerIds.length === 0) {
			result = [];
		} else {
			result = await db.query.customers.findMany({
				// where: (c, { and, inArray, isNull }) => {
				// 	const notDeleted = isNull(c.deletedAt);
				// 	if (allowedCustomerIds) {
				// 		return and(inArray(c.id, allowedCustomerIds), notDeleted);
				// 	}
				// 	return notDeleted;
				// },
				where: {
					AND: [{ deletedAt: { isNull: true } }, { id: { in: allowedCustomerIds as string[] } }]
				},
				orderBy: (c, { desc }) => [desc(c.createdAt)],
				with: {
					user: true
				}
			});
		}

		return {
			customers: result
		};
	} catch (e) {
		console.error(e);
		return { customers: [] };
	}
};
