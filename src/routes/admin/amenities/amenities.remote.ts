import { db } from '$lib/server/db';
import { query } from '$app/server';

export const getAmenities = query(async () => {
	const amenities = await db.query.amenities.findMany();
	return { amenities };
});
