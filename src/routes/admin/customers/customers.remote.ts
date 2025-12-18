import { getRequestEvent, query, form } from '$app/server';
import { db } from '$lib/server/db';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { customers } from '$lib/server/db/schema';
import { softDelete } from '$lib/server/db/soft-delete';
import { customerSchema } from '$lib/schemas/customer';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getCustomers = query(
	z.object({
		searchTerm: z.string().optional(),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, page, pageSize }) => {
		const { sessionUser } = getSession();

		try {
			let allowedCustomerIds: string[] | null = null;

			if (sessionUser.role === 'property_manager' || sessionUser.role === 'staff') {
				let assignedProperties: string[] = [];

				if (sessionUser.role === 'property_manager') {
					const assigns = await db.query.propertyManagerAssignments.findMany({
						where: { userId: sessionUser.id },
						columns: { propertyId: true }
					});
					assignedProperties = assigns.map((a) => a.propertyId);
				} else {
					const profile = await db.query.staffProfiles.findFirst({
						where: { userId: sessionUser.id },
						with: { assignments: true }
					});
					if (profile) {
						assignedProperties = profile.assignments.map((a) => a.propertyId);
					}
				}

				if (assignedProperties.length > 0) {
					const bookingResults = await db.query.bookings.findMany({
						where: { propertyId: { in: assignedProperties } },
						columns: { customerId: true }
					});

					const visitResults = await db.query.visitBookings.findMany({
						where: { propertyId: { in: assignedProperties } },
						columns: { customerId: true }
					});

					const uniqueIds = new Set(
						[
							...bookingResults.map((b) => b.customerId),
							...visitResults.map((v) => v.customerId)
						].filter((id) => id !== null) as string[]
					);

					allowedCustomerIds = Array.from(uniqueIds);
				} else {
					allowedCustomerIds = [];
				}
			}

			if (allowedCustomerIds !== null && allowedCustomerIds.length === 0) {
				return { customers: [], total: 0, page, pageSize, totalPages: 0 };
			}

			// Get total count
			const totalCount = await db.query.customers.findMany({
				where: {
					AND: [
						{ deletedAt: { isNull: true } },
						sessionUser.role === 'admin' ? {} : { id: { in: allowedCustomerIds || [] } },
						searchTerm
							? {
									OR: [
										{ name: { like: `%${searchTerm}%` } },
										{ email: { like: `%${searchTerm}%` } },
										{ phone: { like: `%${searchTerm}%` } }
									]
								}
							: {}
					]
				}
			});

			// Get paginated results
			const offset = (page - 1) * pageSize;
			const result = await db.query.customers.findMany({
				where: {
					AND: [
						{ deletedAt: { isNull: true } },
						sessionUser.role === 'admin' ? {} : { id: { in: allowedCustomerIds || [] } },
						searchTerm
							? {
									OR: [
										{ name: { like: `%${searchTerm}%` } },
										{ email: { like: `%${searchTerm}%` } },
										{ phone: { like: `%${searchTerm}%` } }
									]
								}
							: {}
					]
				},
				with: {
					user: true
				},
				orderBy: (t, { desc }) => [desc(t.createdAt)],
				limit: pageSize,
				offset: offset
			});

			return {
				customers: result,
				total: totalCount.length,
				page,
				pageSize,
				totalPages: Math.ceil(totalCount.length / pageSize)
			};
		} catch (e) {
			console.error('Error fetching customers:', e);
			return { customers: [], total: 0, page, pageSize, totalPages: 0 };
		}
	}
);

export const getCustomer = query(z.string(), async (id) => {
	// const { sessionUser } = getSession();
	try {
		// Simple permission check (should actually verify against role, but this is detail view)
		const customer = await db.query.customers.findFirst({
			where: { AND: [{ deletedAt: { isNull: true } }, { id }] },
			with: {
				user: true,
				bookings: {
					orderBy: { createdAt: 'desc' },
					with: { property: true, room: true }
				}
			}
		});
		if (!customer) throw error(404, 'Customer not found');
		return { customer };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to fetch customer');
	}
});

export const createCustomer = form(customerSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db.insert(customers).values({
			...data
		});
		await getCustomers({}).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to create customer');
	}
});

const updateSchema = customerSchema.extend({
	id: z.string()
});

export const updateCustomer = form(updateSchema, async (data) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db
			.update(customers)
			.set({
				name: data.name,
				email: data.email,
				phone: data.phone,
				addressPermanent: data.addressPermanent,
				idProofType: data.idProofType,
				idProofNumber: data.idProofNumber,
				emergencyContactName: data.emergencyContactName,
				emergencyContactPhone: data.emergencyContactPhone,
				status: data.status,
				updatedAt: new Date()
			})
			.where(eq(customers.id, data.id));

		await getCustomers({}).refresh();
		await getCustomer(data.id).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to update customer');
	}
});

export const deleteCustomer = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') throw error(403, 'Forbidden');

	try {
		await db.update(customers).set(softDelete(sessionUser.id)).where(eq(customers.id, id));
		await getCustomers({}).refresh();
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to delete customer');
	}
});
