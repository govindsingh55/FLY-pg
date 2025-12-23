import { form, getRequestEvent, query } from '$app/server';
import { customerPaymentSchema } from '$lib/schemas/payment';
import { db } from '$lib/server/db';
import { payments } from '$lib/server/db/schema';
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
			orderBy: { paymentDate: 'desc' },
			with: {
				booking: {
					with: {
						property: true,
						room: true
					}
				},
				contract: {
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

// Get customer's active contracts for payment submission
export const getActiveContracts = query(async () => {
	const { sessionUser } = getSession();

	const customer = await db.query.customers.findFirst({
		where: { userId: sessionUser.id }
	});

	if (!customer) return { contracts: [] };

	try {
		const contracts = await db.query.contracts.findMany({
			where: {
				customerId: customer.id,
				status: 'active',
				deletedAt: { isNull: true }
			},
			with: {
				property: true,
				room: true
			},
			orderBy: { createdAt: 'desc' }
		});

		return { contracts };
	} catch (e) {
		console.error(e);
		return { contracts: [] };
	}
});

// Customer payment submission
export const submitPayment = form(customerPaymentSchema, async (data) => {
	const { sessionUser } = getSession();

	// Get customer profile
	const customer = await db.query.customers.findFirst({
		where: { userId: sessionUser.id }
	});

	if (!customer) {
		throw error(404, 'Customer profile not found');
	}

	// Verify ownership of contract or booking
	if (data.contractId) {
		const contract = await db.query.contracts.findFirst({
			where: {
				id: data.contractId,
				customerId: customer.id
			}
		});

		if (!contract) {
			throw error(403, 'Contract not found or does not belong to you');
		}
	}

	if (data.bookingId) {
		const booking = await db.query.bookings.findFirst({
			where: {
				id: data.bookingId,
				customerId: customer.id
			}
		});

		if (!booking) {
			throw error(403, 'Booking not found or does not belong to you');
		}
	}

	// Auto-set status based on payment mode
	// Cash payments are auto-approved, online/UPI need verification
	const status = data.mode === 'cash' ? 'paid' : 'pending';
	const paymentDate = data.mode === 'cash' ? new Date() : null;

	try {
		await db.insert(payments).values({
			customerId: customer.id,
			contractId: data.contractId,
			bookingId: data.bookingId,
			amount: data.amount,
			type: data.type,
			mode: data.mode,
			status,
			transactionId: data.transactionId,
			paymentMethod: data.paymentMethod,
			paymentDate
		});

		await getPayments().refresh();

		return {
			success: true,
			message:
				status === 'paid'
					? 'Payment recorded successfully'
					: 'Payment submitted for verification. You will be notified once verified.'
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to submit payment');
	}
});
