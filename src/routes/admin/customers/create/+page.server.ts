import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { customerSchema } from '$lib/schemas/customer';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);
		const safeParse = customerSchema.safeParse(rawData);

		if (!safeParse.success) {
			return fail(400, {
				data: rawData,
				errors: safeParse.error.flatten().fieldErrors
			});
		}

		try {
			await db.insert(customers).values({
				name: safeParse.data.name,
				email: safeParse.data.email,
				phone: safeParse.data.phone,
				addressPermanent: safeParse.data.addressPermanent,
				idProofType: safeParse.data.idProofType,
				idProofNumber: safeParse.data.idProofNumber,
				emergencyContactName: safeParse.data.emergencyContactName,
				emergencyContactPhone: safeParse.data.emergencyContactPhone,
				status: safeParse.data.status
				// userId: linked later potentially
			});
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to create customer' });
		}

		throw redirect(303, '/admin/customers');
	}
};
