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
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, dateFrom, dateTo, contractId, bookingId, page, pageSize }) => {
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
