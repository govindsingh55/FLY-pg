import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { eq } from 'drizzle-orm';
import { customerSchema } from '$lib/schemas/customer';
import type { Actions, PageServerLoad } from './$types';
import { customers } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ params }) => {
	const customer = await db.query.customers.findFirst({
		where: {
			id: params.id
		},
		with: {
			user: true,
			bookings: true,
			tickets: true
		}
	});

	if (!customer) {
		throw error(404, 'Customer not found');
	}

	return {
		customer
	};
};

export const actions: Actions = {
	update: async ({ request, params }) => {
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
			await db
				.update(customers)
				.set({
					name: safeParse.data.name,
					email: safeParse.data.email,
					phone: safeParse.data.phone,
					addressPermanent: safeParse.data.addressPermanent,
					idProofType: safeParse.data.idProofType,
					idProofNumber: safeParse.data.idProofNumber,
					emergencyContactName: safeParse.data.emergencyContactName,
					emergencyContactPhone: safeParse.data.emergencyContactPhone,
					status: safeParse.data.status
				})
				.where(eq(customers.id, params.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to update customer' });
		}
	},
	delete: async ({ params }) => {
		try {
			await db.delete(customers).where(eq(customers.id, params.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to delete customer' });
		}
		throw redirect(303, '/admin/customers');
	}
};
