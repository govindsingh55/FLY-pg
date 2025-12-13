import { db } from '$lib/server/db';

export const load = async () => {
	try {
		// Fetch all properties ordered by created_at desc
		// Since we want to use query builder:
		const props = await db.query.properties.findMany({
			with: {
				rooms: true
			}
		});

		return {
			properties: props
		};
	} catch (e) {
		console.error(e);
		return { properties: [] };
	}
};
