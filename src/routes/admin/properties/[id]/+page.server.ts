import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { properties } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { propertySchema } from '$lib/schemas/property';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const property = await db.query.properties.findFirst({
		where: {
			id: params.id
		},
		with: {
			rooms: true
		}
	});

	if (!property) {
		throw error(404, 'Property not found');
	}

	return {
		property
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
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
			await db
				.update(properties)
				.set({
					name: safeParse.data.name,
					address: safeParse.data.address,
					description: safeParse.data.description,
					city: safeParse.data.city,
					state: safeParse.data.state,
					zip: safeParse.data.zip,
					contactPhone: safeParse.data.contactPhone
				})
				.where(eq(properties.id, params.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to update property' });
		}
	},
	delete: async ({ params }) => {
		try {
			await db.delete(properties).where(eq(properties.id, params.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to delete property' });
		}
		throw redirect(303, '/admin/properties');
	}
};
