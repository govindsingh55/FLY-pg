import { query } from '$app/server';
import { db } from '$lib/server/db';
import { properties, rooms, media, amenities, foodMenuItems } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import type { InferSelectModel } from 'drizzle-orm';
import z from 'zod';

// Base types from schema
type Property = InferSelectModel<typeof properties>;
type Room = InferSelectModel<typeof rooms>;
type Media = InferSelectModel<typeof media>;
type Amenity = InferSelectModel<typeof amenities>;
type FoodMenuItem = InferSelectModel<typeof foodMenuItems>;

// Query result type (nested structure)
type PropertyQueryResult = Property & {
	rooms: (Room & {
		roomMedia: {
			media: Media | null;
			order: number | null;
			isFeatured: boolean | null;
		}[];
	})[];
	foodMenuItems: FoodMenuItem[];
	amenities: {
		amenity: Amenity | null;
	}[];
	propertyMedia: {
		media: Media | null;
		order: number | null;
		isFeatured: boolean | null;
	}[];
};

// Transformed types for frontend
type TransformedRoom = Room & {
	media: { url: string; type: string }[];
};

type TransformedProperty = Property & {
	rooms: TransformedRoom[];
	media: { url: string; type: string }[];
	foodMenuItems: FoodMenuItem[];
	amenities: { amenity: Amenity }[]; // Keeping strict structure
};

export const getHomeData = query(async () => {
	// properties table query
	const propertiesList = await db.query.properties.findMany({
		where: {
			deletedAt: { isNull: true },
			status: 'published'
		},
		with: {
			rooms: {
				where: {
					deletedAt: { isNull: true },
					status: 'available'
				},
				with: {
					roomMedia: {
						with: {
							media: true
						}
					}
				}
			},
			foodMenuItems: {
				where: {
					deletedAt: { isNull: true },
					isAvailable: true
				}
			},
			amenities: {
				with: {
					amenity: true
				}
			},
			propertyMedia: {
				with: {
					media: true
				}
			}
		}
	});

	const mapProperty = (p: PropertyQueryResult): TransformedProperty => ({
		...p,
		media: p.propertyMedia
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
			.map((pm) => pm.media)
			.filter((m): m is Media => !!m)
			.map((m) => ({
				url: m.url,
				type: m.type
			})),
		rooms: p.rooms.map((r) => ({
			...r,
			media: r.roomMedia
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
				.map((rm) => rm.media)
				.filter((m): m is Media => !!m)
				.map((m) => ({
					url: m.url,
					type: m.type
				}))
		})),
		amenities: p.amenities.filter((a): a is { amenity: Amenity } => !!a.amenity)
	});

	const mappedProperties = propertiesList.map(mapProperty);

	if (propertiesList.length === 1) {
		return {
			mode: 'single' as const,
			property: mappedProperties[0],
			properties: []
		};
	} else {
		// For multiple properties, we might want to return less data per property
		// but since we aren't dealing with huge datasets yet, sending full data is fine.
		return {
			mode: 'multiple' as const,
			properties: mappedProperties,
			property: null
		};
	}
});

export const getPropertyById = query(z.string().min(1).max(255), async (id: string) => {
	const property = await db.query.properties.findFirst({
		where: {
			id,
			deletedAt: { isNull: true },
			status: 'published'
		},
		with: {
			rooms: {
				where: {
					deletedAt: { isNull: true },
					status: 'available'
				},
				with: {
					roomMedia: {
						with: {
							media: true
						}
					}
				}
			},
			foodMenuItems: {
				where: {
					deletedAt: { isNull: true },
					isAvailable: true
				}
			},
			amenities: {
				with: {
					amenity: true
				}
			},
			propertyMedia: {
				with: {
					media: true
				}
			}
		}
	});

	if (!property) throw error(404, 'Property not found');

	// Cast to the expected query result type to ensure safety
	const typedProperty = property as unknown as PropertyQueryResult;

	const mappedProperty: TransformedProperty = {
		...typedProperty,
		media: typedProperty.propertyMedia
			.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
			.map((pm) => pm.media)
			.filter((m): m is Media => !!m)
			.map((m) => ({
				url: m.url,
				type: m.type
			})),
		rooms: typedProperty.rooms.map((r) => ({
			...r,
			media: r.roomMedia
				.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
				.map((rm) => rm.media)
				.filter((m): m is Media => !!m)
				.map((m) => ({
					url: m.url,
					type: m.type
				}))
		})),
		amenities: typedProperty.amenities.filter((a): a is { amenity: Amenity } => !!a.amenity)
	};

	return mappedProperty;
});
