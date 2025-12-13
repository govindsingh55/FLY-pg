import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { properties } from '$lib/server/db/schema';
import { propertySchema } from '$lib/schemas/property';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);
		const safeParse = propertySchema.safeParse(rawData);

		if (!safeParse.success) {
			return fail(400, {
				data: rawData,
				errors: safeParse.error.flatten().fieldErrors
			});
		}

		try {
			await db.insert(properties).values({
				name: safeParse.data.name,
				address: safeParse.data.address,
				description: safeParse.data.description,
				city: safeParse.data.city,
				state: safeParse.data.state,
				zip: safeParse.data.zip,
				contactPhone: safeParse.data.contactPhone,
				amenities: [],
				images: []
			});
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to create property' });
		}

		throw redirect(303, '/admin/properties');
	}
};
