import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getPayments = query(async () => {
	const { sessionUser } = getSession();

	const customer = await db.query.customers.findFirst({
		where: { userId: sessionUser.id }
	});

	if (!customer) return { payments: [] };

	try {
		const result = await db.query.payments.findMany({
			where: { customerId: customer.id },
			orderBy: (payments, { desc }) => [desc(payments.paymentDate)],
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
	} catch (e) {
		console.error(e);
		return { payments: [] };
	}
});
