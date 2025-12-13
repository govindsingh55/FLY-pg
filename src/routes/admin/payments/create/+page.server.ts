import { paymentSchema } from '$lib/schemas/payment';
import { db } from '$lib/server/db';
import { payments } from '$lib/server/db/schema';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// Fetch customers and their active bookings to select from
	try {
		const [custs, bks] = await Promise.all([
			db.query.customers.findMany({
				where: { status: 'active' }
			}),
			db.query.bookings.findMany({
				where: {
					status: {
						ne: 'cancelled'
					}
				}, // Fetch active/pending/completed bookings
				with: {
					property: true,
					room: true,
					customer: true
				}
			})
		]);

		return {
			customers: custs,
			bookings: bks
		};
	} catch (e) {
		console.error(e);
		return { customers: [], bookings: [] };
	}
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);
		const safeParse = paymentSchema.safeParse(rawData);

		if (!safeParse.success) {
			return fail(400, {
				data: rawData,
				errors: safeParse.error.flatten().fieldErrors
			});
		}

		try {
			// If bookingId is provided, ensure customerId matches or use one from booking?
			// Schema requires customerId.

			await db.insert(payments).values({
				customerId: safeParse.data.customerId,
				bookingId: safeParse.data.bookingId || null,
				amount: safeParse.data.amount,
				type: safeParse.data.type,
				status: safeParse.data.status,
				transactionId: safeParse.data.transactionId,
				paymentMethod: safeParse.data.paymentMethod,
				paymentDate: safeParse.data.paymentDate
			});
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'Failed to record payment' });
		}

		throw redirect(303, '/admin/payments');
	}
};
