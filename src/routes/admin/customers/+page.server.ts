import { db } from '$lib/server/db';

export const load = async () => {
	try {
		const result = await db.query.customers.findMany({
			orderBy: (customers, { desc }) => [desc(customers.createdAt)],
			with: {
				user: true // Get linked user info if any
			}
		});

		return {
			customers: result
		};
	} catch (e) {
		console.error(e);
		return { customers: [] };
	}
};
