import { form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { visitBookings } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import z from 'zod';

// Helper to get session securely
const getSession = () => {
	const event = getRequestEvent();
	// locals is available in the event object when using remote functions?
	// Documentation says "Using getRequestEvent" is the way.
	// However, getRequestEvent() returns the event object which has locals.
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getVisits = query(async () => {
	const { sessionUser } = getSession();

	// Get customer profile
	const customer = await db.query.customers.findFirst({
		where: {
			userId: sessionUser.id
		}
	});

	if (!customer) throw error(302, '/dashboard');

	// Fetch visits
	const visits = await db.query.visitBookings.findMany({
		where: {
			customerId: customer.id,
			deletedAt: { isNull: true }
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
			deletedAt: { isNull: true }
		}
	});

	return {
		visits,
		properties: propertiesList
	};
});

export const requestVisit = form(
	z.object({
		propertyId: z.string(),
		visitDate: z.string(),
		visitTime: z.string()
	}),
	async (data) => {
		const { sessionUser } = getSession();

		const customer = await db.query.customers.findFirst({
			where: {
				userId: sessionUser.id
			}
		});
		if (!customer) throw error(400, 'Customer profile required');

		const { propertyId, visitDate: visitDateStr, visitTime: visitTimeStr } = data;

		if (!propertyId || !visitDateStr || !visitTimeStr) {
			throw error(400, 'Missing required fields');
		}

		// Combine date and time to create proper Date objects
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
		await getVisits().refresh();
		return { success: true };
	}
);

export const cancelVisit = form(
	z.object({
		visitId: z.string(),
		reason: z.string().optional()
	}),
	async (data) => {
		const { sessionUser } = getSession();
		const { visitId, reason } = data;

		if (!visitId) throw error(400, 'Visit ID required');

		// Verify ownership
		const customer = await db.query.customers.findFirst({
			where: {
				userId: sessionUser.id
			}
		});
		if (!customer) throw error(403, 'Forbidden');

		const visit = await db.query.visitBookings.findFirst({
			where: {
				id: visitId,
				customerId: customer.id
			}
		});

		if (!visit) throw error(404, 'Visit not found');

		await db
			.update(visitBookings)
			.set({
				status: 'cancelled',
				cancelReason: reason || 'Customer cancelled',
				cancelledBy: sessionUser.id
			})
			.where(eq(visitBookings.id, visitId));
		await getVisits().refresh();
		return { success: true };
	}
);
