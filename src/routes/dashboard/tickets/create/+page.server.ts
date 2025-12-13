import { ticketSchema } from '$lib/schemas/ticket';
import { db } from '$lib/server/db';
import { tickets } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const { user } = await parent();

	// We fetch customer again just to be safe
	const customer = await db.query.customers.findFirst({
		where: { userId: user.id },
		with: {
			bookings: {
				where: { status: { ne: 'cancelled' } },
				with: {
					room: true,
					property: true
				}
			}
		}
	});

	if (!customer) {
		throw redirect(303, '/dashboard');
	}

	return {
		customer
	};
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);
		const safeParse = ticketSchema.safeParse(rawData);

		if (!safeParse.success) {
			return fail(400, {
				data: rawData,
				errors: safeParse.error.flatten().fieldErrors
			});
		}

		// Re-import auth to be sure.
		const { auth } = await import('$lib/server/auth');
		const sessionData = await auth.api.getSession({ headers: request.headers });

		if (!sessionData) {
			return fail(401, { message: 'Unauthorized' });
		}

		const customer = await db.query.customers.findFirst({
			where: { userId: sessionData.user.id }
		});

		if (!customer) {
			return fail(403, { message: 'No customer profile found' });
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
				type: safeParse.data.type,
				description: `${safeParse.data.subject}\n\n${safeParse.data.description}`,
				priority: safeParse.data.priority,
				status: 'open'
			});
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to create ticket' });
		}

		throw redirect(303, '/dashboard/tickets');
	}
};
