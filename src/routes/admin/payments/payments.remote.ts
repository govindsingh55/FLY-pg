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
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, dateFrom, dateTo, page, pageSize }) => {
		const { sessionUser } = getSession();

		try {
			let allowedCustomerIds: string[] | null = null;

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
						columns: { customerId: true }
					});
					allowedCustomerIds = Array.from(
						new Set(bookingResults.map((b) => b.customerId).filter(Boolean) as string[])
					);
				} else {
					return { payments: [] };
				}
			}
			if (sessionUser.role === 'staff') {
				const profile = await db.query.staffProfiles.findFirst({
					where: { userId: sessionUser.id },
					with: { assignments: true }
				});
				if (profile && profile.assignments.length > 0) {
					const propertyIds = profile.assignments.map((a) => a.propertyId);
					const bookingResults = await db.query.bookings.findMany({
						where: { propertyId: { in: propertyIds } },
						columns: { customerId: true }
					});
					allowedCustomerIds = Array.from(
						new Set(bookingResults.map((b) => b.customerId).filter(Boolean) as string[])
					);
				} else {
					return { payments: [] };
				}
			}

			const result = await db.query.payments.findMany({
				where: {
					AND: [
						sessionUser.role == 'admin' ? {} : { customerId: { in: allowedCustomerIds || [] } },
						searchTerm
							? {
									OR: [
										{ customer: { name: { like: `%${searchTerm}%` } } },
										{ booking: { property: { name: { like: `%${searchTerm}%` } } } },
										{ booking: { room: { number: { like: `%${searchTerm}%` } } } }
									]
								}
							: {},
						dateFrom ? { paymentDate: { gte: new Date(dateFrom) } } : {},
						dateTo ? { paymentDate: { lte: new Date(dateTo) } } : {}
					]
				},
				with: {
					customer: true,
					booking: {
						with: {
							property: true,
							room: true
						}
					}
				},
				orderBy: (t, { desc }) => [desc(t.createdAt)],
				limit: pageSize,
				offset: (page - 1) * pageSize
			});

			// Get total count
			const totalCount = await db.query.payments.findMany({
				where: {
					AND: [
						sessionUser.role == 'admin' ? {} : { customerId: { in: allowedCustomerIds || [] } },
						searchTerm
							? {
									OR: [
										{ customer: { name: { like: `%${searchTerm}%` } } },
										{ booking: { property: { name: { like: `%${searchTerm}%` } } } },
										{ booking: { room: { number: { like: `%${searchTerm}%` } } } }
									]
								}
							: {},
						dateFrom ? { paymentDate: { gte: new Date(dateFrom) } } : {},
						dateTo ? { paymentDate: { lte: new Date(dateTo) } } : {}
					]
				}
			});

			return {
				payments: result,
				total: totalCount.length,
				page,
				pageSize,
				totalPages: Math.ceil(totalCount.length / pageSize)
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
