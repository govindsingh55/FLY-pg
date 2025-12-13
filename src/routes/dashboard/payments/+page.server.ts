import { db } from '$lib/server/db';

export const load = async ({ parent }) => {
	const { user } = await parent();

	// Fetch customer ID
	const customer = await db.query.customers.findFirst({
		where: { userId: user.id }
	});

	if (!customer) return { payments: [] };

	const result = await db.query.payments.findMany({
		where: { customerId: customer.id },
		orderBy: {
			paymentDate: 'desc'
		},
		with: {
			booking: {
				with: {
					property: true,
					room: true
				}
			}
		}
	});

	return { payments: result };
};
