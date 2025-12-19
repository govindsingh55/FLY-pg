import { form, getRequestEvent, query } from '$app/server';
import { updateContractSchema } from '$lib/schemas/contract';
import { db } from '$lib/server/db';
import { contracts, properties } from '$lib/server/db/schema';
import { softDelete, notDeletedFilter } from '$lib/server/db/soft-delete';
import { error } from '@sveltejs/kit';
import { eq, like } from 'drizzle-orm';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getContracts = query(
	z.object({
		searchTerm: z.string().optional(),
		status: z.enum(['active', 'expired', 'terminated', 'all']).default('all'),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, status, page, pageSize }) => {
		const { sessionUser } = getSession();

		try {
			let allowedPropertyIds: string[] | null = null;

			if (sessionUser.role === 'property_manager') {
				const assignments = await db.query.propertyManagerAssignments.findMany({
					where: { userId: sessionUser.id },
					columns: { propertyId: true }
				});
				allowedPropertyIds = assignments.map((a) => a.propertyId);
				if (allowedPropertyIds.length === 0)
					return { contracts: [], total: 0, page, pageSize, totalPages: 0 };
			}

			if (sessionUser.role === 'staff') {
				const staffProfile = await db.query.staffProfiles.findFirst({
					where: { userId: sessionUser.id },
					with: { assignments: true }
				});
				if (staffProfile && staffProfile.assignments.length > 0) {
					allowedPropertyIds = staffProfile.assignments.map((a) => a.propertyId);
				} else {
					return { contracts: [], total: 0, page, pageSize, totalPages: 0 };
				}
			}

			let matchedPropertyIds: string[] = [];
			if (searchTerm) {
				const props = await db
					.select({ id: properties.id })
					.from(properties)
					.where(like(properties.name, `%${searchTerm}%`));
				matchedPropertyIds = props.map((p) => p.id);
			}

			let whereStatus = {};
			if (status && status !== 'all') {
				whereStatus = { status };
			}

			const where = {
				...notDeletedFilter(),
				...whereStatus,
				...(sessionUser.role !== 'admin' && sessionUser.role !== 'manager'
					? { propertyId: { in: allowedPropertyIds || [] } }
					: {}),
				...(searchTerm
					? {
							OR: [
								{ id: { like: `%${searchTerm}%` } },
								{ customerId: { like: `%${searchTerm}%` } },
								...(matchedPropertyIds.length > 0
									? [{ propertyId: { in: matchedPropertyIds } }]
									: [])
							]
						}
					: {})
			};

			// Get count
			const resultsList = await db.query.contracts.findMany({
				where,
				columns: { id: true }
			});

			const offset = (page - 1) * pageSize;
			const data = await db.query.contracts.findMany({
				where,
				limit: pageSize,
				offset: offset,
				orderBy: { createdAt: 'desc' },
				with: {
					customer: true,
					property: true,
					room: true
				}
			});

			return {
				contracts: data,
				total: resultsList.length,
				page,
				pageSize,
				totalPages: Math.ceil(resultsList.length / pageSize)
			};
		} catch (e) {
			console.error(e);
			return { contracts: [], total: 0, page, pageSize, totalPages: 0 };
		}
	}
);

export const getContract = query(z.string(), async (id) => {
	const { sessionUser } = getSession();

	const contract = await db.query.contracts.findFirst({
		where: { id, ...notDeletedFilter() },
		with: {
			customer: true,
			property: true,
			room: true,
			booking: true,
			payments: {
				orderBy: (t, { desc }) => [desc(t.paymentDate)]
			}
		}
	});

	if (!contract) {
		throw error(404, 'Contract not found');
	}

	// Permission check
	if (sessionUser.role === 'property_manager' || sessionUser.role === 'staff') {
		// Verify if they have access to this property
		const assignments = await db.query.propertyManagerAssignments.findMany({
			where: { userId: sessionUser.id, propertyId: contract.propertyId },
			limit: 1
		});
		if (assignments.length === 0 && sessionUser.role === 'property_manager') {
			throw error(403, 'Forbidden');
		}
	}

	return { contract };
});

// Loose schema for form input to satisfy RemoteFormInput
const updateContractFormSchema = z.object({
	id: z.string(),
	rentAmount: z.union([z.string(), z.number()]),
	securityDeposit: z.union([z.string(), z.number()]).optional(),
	startDate: z.string(),
	endDate: z.string().optional(),
	status: z.enum(['active', 'expired', 'terminated']).default('active'),
	includeFood: z.union([z.boolean(), z.string()]).optional(),
	contractType: z.enum(['rent', 'lease', 'other']).default('rent'),
	terminationDate: z.string().optional(),
	terminationReason: z.string().optional(),
	notes: z.string().optional(),
	documentUrl: z.string().optional()
});

export const updateContract = form(updateContractFormSchema, async (formData) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	const { id, ...rest } = formData;
	// Validate with strict schema for logic
	const data = updateContractSchema.parse(rest);

	try {
		await db
			.update(contracts)
			.set({
				rentAmount: data.rentAmount,
				securityDeposit: data.securityDeposit,
				startDate: data.startDate,
				endDate: data.endDate,
				status: data.status,
				includeFood: data.includeFood,
				contractType: data.contractType,
				terminationDate: data.terminationDate,
				terminationReason: data.terminationReason,
				notes: data.notes,
				documentUrl: data.documentUrl,
				updatedAt: new Date()
			})
			.where(eq(contracts.id, id));

		await getContracts({}).refresh();
		await getContract(id).refresh();

		return { success: true };
	} catch (e) {
		console.error('Update Contract Error:', e);
		throw error(500, 'Failed to update contract');
	}
});

export const deleteContract = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin' && sessionUser.role !== 'manager') {
		throw error(403, 'Forbidden');
	}

	try {
		await db.update(contracts).set(softDelete(sessionUser.id)).where(eq(contracts.id, id));

		await getContracts({}).refresh();
		return { success: true };
	} catch (e) {
		console.error('Delete Contract Error:', e);
		throw error(500, 'Failed to delete contract');
	}
});
