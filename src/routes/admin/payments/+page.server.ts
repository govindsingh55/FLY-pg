import { db } from '$lib/server/db';
import { payments } from '$lib/server/db/schema';

export const load = async () => {
	try {
		const result = await db.query.payments.findMany({
			with: {
				customer: true,
				booking: {
					with: {
						property: true,
						room: true
					}
				}
			},
			orderBy: (payments, { desc }) => [desc(payments.createdAt)]
		});

		return {
			payments: result
		};
	} catch (e) {
		console.error(e);
		return { payments: [] };
	}
};
