import { db } from '$lib/server/db';

export const load = async ({ parent }) => {
	const { user } = await parent();

	// Fetch customer ID first
	const customer = await db.query.customers.findFirst({
		where: {
			id: user.id
		}
	});

	if (!customer) {
		// Should interact with support or redirect if strictly authenticated area
		return { tickets: [] };
	}

	try {
		const result = await db.query.tickets.findMany({
			where: {
				customerId: customer.id
			},
			with: {
				room: true // to show which room
			},
			orderBy: (tickets, { desc }) => [desc(tickets.createdAt)]
		});

		return {
			tickets: result
		};
	} catch (e) {
		console.error(e);
		return { tickets: [] };
	}
};
