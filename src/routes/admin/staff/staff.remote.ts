import { form, getRequestEvent, query } from '$app/server';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { staffProfiles, user } from '$lib/server/db/schema';
import { softDelete } from '$lib/server/db/soft-delete';
import { error } from '@sveltejs/kit';
import { and, count, desc, eq, ilike, inArray, isNull, or } from 'drizzle-orm';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getStaff = query(
	z.object({
		searchTerm: z.string().optional(),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, page, pageSize }) => {
		const { sessionUser } = getSession();
		if (
			sessionUser.role !== 'admin' &&
			sessionUser.role !== 'manager' &&
			sessionUser.role !== 'property_manager'
		) {
			throw error(403, 'Forbidden');
		}

		try {
			// Define the roles we want to fetch
			const targetRoles = ['manager', 'property_manager', 'staff'] as const;

			// Define the filter condition separately for reuse in count and select
			const searchCondition = searchTerm
				? or(ilike(user.name, `%${searchTerm}%`), ilike(user.email, `%${searchTerm}%`))
				: undefined;

			const filterCondition = and(
				inArray(user.role, targetRoles),
				isNull(user.deletedAt),
				searchCondition
			);

			// 1. Get total count
			const [totalResult] = await db.select({ count: count() }).from(user).where(filterCondition);

			// 2. Get matched IDs with pagination using db.select (allows complex filters)
			const offset = (page - 1) * pageSize;

			const matchedUsers = await db
				.select({ id: user.id })
				.from(user)
				.where(filterCondition)
				.limit(pageSize)
				.offset(offset)
				.orderBy(desc(user.createdAt));

			if (matchedUsers.length === 0) {
				return { staff: [], total: totalResult?.count ?? 0, page, pageSize, totalPages: 0 };
			}

			const matchedUserIds = matchedUsers.map((u) => u.id);

			// 3. Hydrate relations using db.query (preserves relational types)
			let usersList = await db.query.user.findMany({
				where: {
					id: { in: matchedUserIds }
				},
				with: {
					staffProfile: {
						with: {
							assignments: {
								with: {
									property: true
								}
							}
						}
					},
					propertyManagerAssignments: {
						with: {
							property: true
						}
					}
				},
				orderBy: { createdAt: 'desc' }
			});

			// Filter for property managers - only show staff assigned to their properties
			if (sessionUser.role === 'property_manager') {
				const pmAssignments = await db.query.propertyManagerAssignments.findMany({
					where: { userId: sessionUser.id },
					columns: { propertyId: true }
				});
				const assignedPropertyIds = pmAssignments.map((a) => a.propertyId);

				usersList = usersList.filter((u) => {
					if (u.role === 'staff' && u.staffProfile?.assignments) {
						return u.staffProfile.assignments.some((a) =>
							assignedPropertyIds.includes(a.propertyId)
						);
					}
					return false;
				});
			}

			// Define proper types for the query result
			type UserWithRelations = (typeof usersList)[number];
			type Assignment = NonNullable<UserWithRelations['staffProfile']>['assignments'][number];
			type PropertyManagerAssignment = UserWithRelations['propertyManagerAssignments'][number];
			type Property = NonNullable<Assignment['property']>;

			return {
				staff: usersList.map((u: UserWithRelations) => {
					let assignments: { id: string; name: string }[] = [];

					if (u.role === 'staff' && u.staffProfile?.assignments) {
						assignments = u.staffProfile.assignments
							.map((a: Assignment) => a.property)
							.filter((p): p is Property => p !== null && p !== undefined)
							.map((p) => ({ id: p.id, name: p.name }));
					} else if (u.role === 'property_manager' && u.propertyManagerAssignments) {
						assignments = u.propertyManagerAssignments
							.map((a: PropertyManagerAssignment) => a.property)
							.filter((p): p is Property => p !== null && p !== undefined)
							.map((p) => ({ id: p.id, name: p.name }));
					}

					return {
						id: u.staffProfile?.id || u.id,
						userId: u.id,
						name: u.name,
						email: u.email,
						role: u.role,
						staffType: u.staffProfile?.staffType,
						assignments
					};
				}),
				total: totalResult?.count ?? 0,
				page,
				pageSize,
				totalPages: Math.ceil((totalResult?.count ?? 0) / pageSize)
			};
		} catch (e) {
			console.error(e);
			return { staff: [], total: 0, page, pageSize, totalPages: 0 };
		}
	}
);

const staffSchema = z.object({
	name: z.string().min(1),
	email: z.string().email(),
	password: z.string().min(6),
	staffType: z.enum(['chef', 'janitor', 'security'])
});

export const createStaff = form(staffSchema, async ({ name, email, password, staffType }) => {
	const { sessionUser } = getSession();
	if (
		sessionUser.role !== 'admin' &&
		sessionUser.role !== 'manager' &&
		sessionUser.role !== 'property_manager'
	) {
		throw error(403, 'Forbidden');
	}

	try {
		const response = await auth.api.signUpEmail({
			body: {
				email,
				password,
				name
			},
			asResponse: false
		});

		if (!response || !response.user) {
			throw error(500, 'Failed to create user');
		}

		await db
			.update(user)
			.set({
				role: 'staff'
			})
			.where(eq(user.id, response.user.id));

		await db.insert(staffProfiles).values({
			userId: response.user.id,
			staffType
		});

		await getStaff({}).refresh();
		return { success: true };
	} catch (e: unknown) {
		console.error(e);
		throw error(500, (e as Error).message || 'Error creating staff');
	}
});

const updateStaffSchema = z.object({
	id: z.string(),
	staffType: z.enum(['chef', 'janitor', 'security'])
});

export const updateStaff = form(updateStaffSchema, async ({ id, staffType }) => {
	const { sessionUser } = getSession();
	if (
		sessionUser.role !== 'admin' &&
		sessionUser.role !== 'manager' &&
		sessionUser.role !== 'property_manager'
	) {
		throw error(403, 'Forbidden');
	}

	// For property managers, verify they can only update staff assigned to their properties
	if (sessionUser.role === 'property_manager') {
		const pmAssignments = await db.query.propertyManagerAssignments.findMany({
			where: { userId: sessionUser.id },
			columns: { propertyId: true }
		});
		const assignedPropertyIds = pmAssignments.map((a) => a.propertyId);

		const staffProfile = await db.query.staffProfiles.findFirst({
			where: { id },
			with: { assignments: true }
		});

		if (!staffProfile?.assignments.some((a) => assignedPropertyIds.includes(a.propertyId))) {
			throw error(403, 'You can only update staff assigned to your properties');
		}
	}

	await db.update(staffProfiles).set({ staffType }).where(eq(staffProfiles.id, id));
	await getStaff({}).refresh();
	return { success: true };
});

export const deleteStaff = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
	if (
		sessionUser.role !== 'admin' &&
		sessionUser.role !== 'manager' &&
		sessionUser.role !== 'property_manager'
	) {
		throw error(403, 'Forbidden');
	}

	// For property managers, verify they can only delete staff assigned to their properties
	if (sessionUser.role === 'property_manager') {
		const pmAssignments = await db.query.propertyManagerAssignments.findMany({
			where: { userId: sessionUser.id },
			columns: { propertyId: true }
		});
		const assignedPropertyIds = pmAssignments.map((a) => a.propertyId);

		const staffProfile = await db.query.staffProfiles.findFirst({
			where: { id },
			with: { assignments: true }
		});

		if (!staffProfile?.assignments.some((a) => assignedPropertyIds.includes(a.propertyId))) {
			throw error(403, 'You can only delete staff assigned to your properties');
		}
	}

	await db.update(staffProfiles).set(softDelete(sessionUser.id)).where(eq(staffProfiles.id, id));

	const profile = await db.query.staffProfiles.findFirst({
		where: {
			id
		},
		columns: { userId: true }
	});

	if (profile) {
		await db.update(user).set(softDelete(sessionUser.id)).where(eq(user.id, profile.userId));
	}

	await getStaff({}).refresh();
	return { success: true };
});
