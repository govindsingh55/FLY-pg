import { db } from '$lib/server/db';

export const load = async () => {
	try {
		const result = await db.query.bookings.findMany({
			with: {
				property: true,
				room: true,
				customer: true
			},
			orderBy: (bookings, { desc }) => [desc(bookings.createdAt)]
		});

		return {
			bookings: result
		};
	} catch (e) {
		console.error(e);
		return { bookings: [] };
	}
};
