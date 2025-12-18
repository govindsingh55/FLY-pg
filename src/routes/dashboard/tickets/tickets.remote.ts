import { form, getRequestEvent, query } from '$app/server';
import { ticketSchema } from '$lib/schemas/ticket';
import { db } from '$lib/server/db';
import { tickets } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getTickets = query(async () => {
	const { sessionUser } = getSession();

	const customer = await db.query.customers.findFirst({
		where: {
			userId: sessionUser.id
		}
	});

	if (!customer) {
		return { tickets: [] };
	}

	try {
		const result = await db.query.tickets.findMany({
			where: {
				customerId: customer.id
			},
			with: {
				room: true
			},
			orderBy: { createdAt: 'desc' }
		});

		return {
			tickets: result
		};
	} catch (e) {
		console.error(e);
		return { tickets: [] };
	}
});

export const createTicket = form(ticketSchema, async (data) => {
	const { sessionUser } = getSession();

	const customer = await db.query.customers.findFirst({
		where: { userId: sessionUser.id }
	});

	if (!customer) {
		throw error(403, 'No customer profile found');
	}

	try {
		let targetRoomId = null;

		const activeBooking = await db.query.bookings.findFirst({
			where: { customerId: customer.id, status: { ne: 'cancelled' } },
			with: { room: true }
		});

		if (activeBooking) {
			targetRoomId = activeBooking.roomId;
		}

		await db.insert(tickets).values({
			customerId: customer.id,
			roomId: targetRoomId,
			type: data.type,
			description: `${data.subject}\n\n${data.description}`,
			priority: data.priority,
			status: 'open'
		});

		await getTickets().refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to create ticket');
	}
});
