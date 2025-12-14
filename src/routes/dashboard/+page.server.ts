import { db } from '$lib/server/db';

export const load = async ({ parent }) => {
	const { user } = await parent();

	try {
		// Find the customer profile linked to this user
		const customer = await db.query.customers.findFirst({
			where: {
				userId: user.id
			},
			with: {
				bookings: {
					where: {
						status: {
							ne: 'cancelled'
						}
					},
					with: {
						property: true,
						room: true
					}
				},
				payments: {
					orderBy: (payments, { desc }) => [desc(payments.paymentDate)],
					limit: 5
				},
				tickets: true // Maybe recent tickets?
			}
		});
		console.log({ customer, user });
		return {
			customer
		};
	} catch (e) {
		console.error(e);
		return { customer: null };
	}
};
