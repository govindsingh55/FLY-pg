import { query } from '$app/server';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import z from 'zod';

export const getHomeData = query(async () => {
	// properties table query
	const propertiesList = await db.query.properties.findMany({
		where: {
			deletedAt: { isNull: true },
			status: { eq: 'published' }
		},
		with: {
			rooms: {
				where: {
					deletedAt: { isNull: true },
					status: { eq: 'available' }
				}
			},
			foodMenuItems: {
				where: {
					deletedAt: { isNull: true },
					isAvailable: { eq: true }
				}
			}
		}
	});

	if (propertiesList.length === 1) {
		return {
			mode: 'single' as const,
			property: propertiesList[0],
			properties: []
		};
	} else {
		// For multiple properties, we might want to return less data per property
		// but since we aren't dealing with huge datasets yet, sending full data is fine.
		return {
			mode: 'multiple' as const,
			properties: propertiesList,
			property: null
		};
	}
});

export const getPropertyById = query(z.string().min(1).max(255), async (id: string) => {
	const property = await db.query.properties.findFirst({
		where: {
			id: { eq: id },
			deletedAt: { isNull: true },
			status: { eq: 'published' }
		},
		with: {
			rooms: {
				where: {
					deletedAt: { isNull: true },
					status: { eq: 'available' }
				}
			},
			foodMenuItems: {
				where: {
					deletedAt: { isNull: true },
					isAvailable: { eq: true }
				}
			}
		}
	});

	if (!property) throw error(404, 'Property not found');
	return property;
});
