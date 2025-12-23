import { form, getRequestEvent, query } from '$app/server';
import { paymentSchema } from '$lib/schemas/payment';
import { db } from '$lib/server/db';
import { payments } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getPayments = query(
	z.object({
		searchTerm: z.string().optional(),
		dateFrom: z.string().optional(),
		dateTo: z.string().optional(),
		contractId: z.string().optional(),
		bookingId: z.string().optional(),
		statusFilter: z.enum(['pending', 'paid', 'failed', 'refunded']).optional(),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, dateFrom, dateTo, contractId, bookingId, statusFilter, page, pageSize }) => {
		const { sessionUser } = getSession();

		try {
			let allowedBookingIds: string[] | null = null;

			if (sessionUser.role === 'property_manager') {
				const assigns = await db.query.propertyManagerAssignments.findMany({
					where: {
						userId: sessionUser.id
					},
					columns: { propertyId: true }
				});
				const propertyIds = assigns.map((a) => a.propertyId);
				if (propertyIds.length > 0) {
					const bookingResults = await db.query.bookings.findMany({
						where: {
							AND: [{ propertyId: { in: propertyIds } }, { deletedAt: { isNull: true } }]
						},
						columns: { id: true }
					});
					allowedBookingIds = bookingResults.map((b) => b.id);
				} else {
					return { payments: [], total: 0, page, pageSize, totalPages: 0 };
				}
			}

			if (allowedBookingIds !== null && allowedBookingIds.length === 0) {
				return { payments: [], total: 0, page, pageSize, totalPages: 0 };
			}

			const where = {
				...(sessionUser.role === 'property_manager' && allowedBookingIds
					? { bookingId: { in: allowedBookingIds } }
					: {}),
				...(contractId ? { contractId: { eq: contractId } } : {}),
				...(bookingId ? { bookingId: { eq: bookingId } } : {}),
				...(statusFilter ? { status: { eq: statusFilter } } : {}),
				...(searchTerm
					? {
							OR: [
								{ customer: { name: { like: `%${searchTerm}%` } } },
								{ booking: { property: { name: { like: `%${searchTerm}%` } } } },
								{ booking: { room: { number: { like: `%${searchTerm}%` } } } },
								{ contractId: { like: `%${searchTerm}%` } },
								{ bookingId: { like: `%${searchTerm}%` } }
							]
						}
					: {}),
				...(dateFrom ? { paymentDate: { gte: new Date(dateFrom) } } : {}),
				...(dateTo ? { paymentDate: { lte: new Date(dateTo) } } : {})
			};

			const result = await db.query.payments.findMany({
				where,
				with: {
					customer: true,
					contract: true,
					booking: {
						with: {
							property: true,
							room: true
						}
					}
				},
				orderBy: { createdAt: 'desc' },
				limit: pageSize,
				offset: (page - 1) * pageSize
			});

			// Get total count
			const resultsList = await db.query.payments.findMany({
				where,
				columns: { id: true }
			});

			return {
				payments: result,
				total: resultsList.length,
				page,
				pageSize,
				totalPages: Math.ceil(resultsList.length / pageSize)
			};
		} catch (e) {
			console.error(e);
			return { payments: [] };
		}
	}
);

export const createPayment = form(paymentSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db.insert(payments).values({ ...data });
		await getPayments({}).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to create payment');
	}
});

const updateSchema = paymentSchema.extend({
	id: z.string()
});

export const updatePayment = form(updateSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db
			.update(payments)
			.set({
				bookingId: data.bookingId,
				customerId: data.customerId,
				amount: data.amount,
				type: data.type,
				mode: data.mode,
				status: data.status,
				transactionId: data.transactionId,
				paymentMethod: data.paymentMethod,
				paymentDate: data.paymentDate,
				updatedAt: new Date()
			})
			.where(eq(payments.id, data.id));

		await getPayments({}).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to update payment');
	}
});

// Payment verification schema
const verifyPaymentSchema = z.object({
	id: z.string(),
	status: z.enum(['paid', 'failed'])
});

export const verifyPayment = form(verifyPaymentSchema, async (data) => {
	const { sessionUser } = getSession();

	// Check role - admin, manager, or property_manager
	if (!['admin', 'manager', 'property_manager'].includes(sessionUser.role || '')) {
		throw error(403, 'Forbidden');
	}

	// If property manager, verify they have access to this payment's property
	if (sessionUser.role === 'property_manager') {
		const payment = await db.query.payments.findFirst({
			where: { id: data.id },
			with: {
				booking: {
					columns: { propertyId: true }
				},
				contract: {
					columns: { propertyId: true }
				}
			}
		});

		if (!payment) {
			throw error(404, 'Payment not found');
		}

		const propertyId = payment.booking?.propertyId || payment.contract?.propertyId;

		if (propertyId) {
			const hasAccess = await db.query.propertyManagerAssignments.findFirst({
				where: {
					userId: sessionUser.id,
					propertyId: propertyId
				}
			});

			if (!hasAccess) {
				throw error(403, 'You do not have access to verify this payment');
			}
		}
	}

	try {
		await db
			.update(payments)
			.set({
				status: data.status,
				paymentDate: data.status === 'paid' ? new Date() : null,
				updatedAt: new Date()
			})
			.where(eq(payments.id, data.id));

		await getPayments({}).refresh();

		return {
			success: true,
			message: data.status === 'paid' ? 'Payment verified successfully' : 'Payment marked as failed'
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to verify payment');
	}
});

// Bulk payment verification
const bulkVerifySchema = z.object({
	paymentIds: z.array(z.string()).min(1, 'At least one payment must be selected'),
	status: z.enum(['paid', 'failed'])
});

export const bulkVerifyPayments = form(bulkVerifySchema, async (data) => {
	const { sessionUser } = getSession();

	if (!['admin', 'manager', 'property_manager'].includes(sessionUser.role || '')) {
		throw error(403, 'Forbidden');
	}

	try {
		// For property managers, verify all payments belong to their properties
		if (sessionUser.role === 'property_manager') {
			const paymentsToVerify = await db.query.payments.findMany({
				where: {
					id: { in: data.paymentIds }
				},
				with: {
					booking: { columns: { propertyId: true } },
					contract: { columns: { propertyId: true } }
				}
			});

			const assigns = await db.query.propertyManagerAssignments.findMany({
				where: { userId: sessionUser.id },
				columns: { propertyId: true }
			});

			const allowedPropertyIds = assigns.map((a) => a.propertyId);

			for (const payment of paymentsToVerify) {
				const propertyId = payment.booking?.propertyId || payment.contract?.propertyId;
				if (propertyId && !allowedPropertyIds.includes(propertyId)) {
					throw error(403, 'You do not have access to verify all selected payments');
				}
			}
		}

		// Update all payments
		for (const paymentId of data.paymentIds) {
			await db
				.update(payments)
				.set({
					status: data.status,
					paymentDate: data.status === 'paid' ? new Date() : null,
					updatedAt: new Date()
				})
				.where(eq(payments.id, paymentId));
		}

		await getPayments({}).refresh();

		return {
			success: true,
			message: `${data.paymentIds.length} payment(s) ${data.status === 'paid' ? 'verified' : 'rejected'} successfully`
		};
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to bulk verify payments');
	}
});
