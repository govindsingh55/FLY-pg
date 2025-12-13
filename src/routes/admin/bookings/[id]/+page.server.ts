import { db } from '$lib/server/db';
import { bookings } from '$lib/server/db/schema';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const booking = await db.query.bookings.findFirst({
		where: {
			id: params.id
		},
		with: {
			property: true,
			room: true,
			customer: true,
			payments: true
		}
	});

	if (!booking) {
		throw error(404, 'Booking not found');
	}

	return {
		booking
	};
};

export const actions: Actions = {
	cancel: async ({ params }) => {
		try {
			await db.update(bookings).set({ status: 'cancelled' }).where(eq(bookings.id, params.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to cancel booking' });
		}
	}
};
