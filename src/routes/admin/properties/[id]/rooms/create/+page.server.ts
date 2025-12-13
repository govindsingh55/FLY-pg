import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { rooms } from '$lib/server/db/schema';
import { roomSchema } from '$lib/schemas/room';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);
		const safeParse = roomSchema.safeParse(rawData);

		if (!safeParse.success) {
			return fail(400, {
				data: rawData,
				errors: safeParse.error.flatten().fieldErrors
			});
		}

		try {
			await db.insert(rooms).values({
				propertyId: params.id!, // From route param
				number: safeParse.data.number,
				type: safeParse.data.type,
				capacity: safeParse.data.capacity,
				priceMonthly: safeParse.data.priceMonthly,
				depositAmount: safeParse.data.depositAmount,
				status: safeParse.data.status,
				features: []
			});
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to create room' });
		}

		throw redirect(303, `/admin/properties/${params.id}`);
	}
};
