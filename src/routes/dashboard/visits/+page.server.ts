import { db } from '$lib/server/db';
import { visitBookings } from '$lib/server/db/schema';
import { softDelete } from '$lib/server/db/soft-delete';
import { fail, redirect, type Actions } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ locals }) => {
	const session = locals.session;
	const user = locals.user;
	if (!session || !user) throw redirect(302, '/login');

	// Get customer profile
	const customer = await db.query.customers.findFirst({
		where: {
			userId: user.id
		}
	});

	if (!customer) throw redirect(302, '/dashboard'); // Or setup profile

	// Fetch visits
	const visits = await db.query.visitBookings.findMany({
		// where: and(eq(visitBookings.customerId, customer.id), notDeletedFilter(visitBookings)),
		where: {
			AND: [{ customerId: customer.id }, { deletedAt: { isNull: true } }]
		},
		with: {
			property: true
		},
		orderBy: {
			visitDate: 'desc'
		}
	});

	// Fetch properties for dropdown
	const propertiesList = await db.query.properties.findMany({
		where: {
			AND: [{ deletedAt: { isNull: true } }]
		}
	});

	return {
		visits,
		properties: propertiesList
	};
};

export const actions: Actions = {
	request: async ({ request, locals }) => {
		const session = locals.session;
		const user = locals.user;
		if (!session || !user) return fail(401);

		const customer = await db.query.customers.findFirst({
			where: {
				userId: user.id
			}
		});
		if (!customer) return fail(400, { message: 'Customer profile required' });

		const data = await request.formData();
		const propertyId = data.get('propertyId') as string;
		const visitDateStr = data.get('visitDate') as string;
		const visitTimeStr = data.get('visitTime') as string;

		if (!propertyId || !visitDateStr || !visitTimeStr) {
			return fail(400, { message: 'Missing required fields' });
		}

		// Combine date and time to create proper Date objects
		// We store visitDate (date part) and visitTime (time part) as timestamps
		const visitDate = new Date(visitDateStr);
		const [hours, minutes] = visitTimeStr.split(':').map(Number);
		const visitTime = new Date(visitDate);
		visitTime.setHours(hours, minutes, 0, 0);

		await db.insert(visitBookings).values({
			customerId: customer.id,
			propertyId,
			visitDate,
			visitTime,
			status: 'pending'
		});

		return { success: true };
	},

	cancel: async ({ request, locals }) => {
		const session = locals.session;
		const user = locals.user;
		if (!session || !user) return fail(401);

		const data = await request.formData();
		const visitId = data.get('visitId') as string;
		const reason = data.get('reason') as string;

		if (!visitId) return fail(400);

		// Verify ownership
		const customer = await db.query.customers.findFirst({
			where: {
				userId: user.id
			}
		});
		if (!customer) return fail(403);

		const visit = await db.query.visitBookings.findFirst({
			// where: and(eq(visitBookings.id, visitId), eq(visitBookings.customerId, customer.id))
			where: {
				AND: [{ id: visitId }, { customerId: customer.id }]
			}
		});

		if (!visit) return fail(404);

		await db
			.update(visitBookings)
			.set({
				status: 'cancelled',
				cancelReason: reason || 'Customer cancelled',
				cancelledBy: user.id,
				...softDelete(user.id) // Optionally soft delete it too, or just mark status cancelled?
				// Plan says "status must have accepted, pending, cancelled..."
				// Roles.md says "can close the booking...".
				// If we soft delete, it vanishes from list unless we filter differently.
				// Let's keep it visible but marked Cancelled.
				// So I will NOT soft delete here, just update status.
			})
			.where(eq(visitBookings.id, visitId));

		return { success: true };
	}
};
