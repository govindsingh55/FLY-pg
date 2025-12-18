import { form, getRequestEvent, query } from '$app/server';
import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { staffProfiles, user } from '$lib/server/db/schema';
import { softDelete } from '$lib/server/db/soft-delete';
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

export const getStaff = query(
	z.object({
		searchTerm: z.string().optional(),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, page, pageSize }) => {
		const { sessionUser } = getSession();
		if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

		try {
			// Find user IDs matching the search term
			let matchedUserIds: string[] = [];
			if (searchTerm) {
				const users = await db.query.user.findMany({
					where: {
						OR: [{ name: { like: `%${searchTerm}%` } }, { email: { like: `%${searchTerm}%` } }]
					},
					columns: { id: true }
				});
				matchedUserIds = users.map((u) => u.id);
			}

			// Get total count
			const totalCount = await db.query.staffProfiles.findMany({
				where: {
					AND: [
						{ deletedAt: { isNull: true } },
						searchTerm
							? {
									userId: { in: matchedUserIds.length > 0 ? matchedUserIds : ['nomatch'] }
								}
							: {}
					]
				}
			});

			// Get paginated results
			const offset = (page - 1) * pageSize;
			const staffList = await db.query.staffProfiles.findMany({
				where: {
					AND: [
						{ deletedAt: { isNull: true } },
						searchTerm
							? {
									userId: { in: matchedUserIds.length > 0 ? matchedUserIds : ['nomatch'] }
								}
							: {}
					]
				},
				with: {
					user: true,
					assignments: {
						with: {
							property: true
						}
					}
				},
				limit: pageSize,
				offset: offset
			});

			return {
				staff: staffList
					.filter((p) => p.user && p.user != null)
					.map((p) => ({
						id: p.id,
						userId: p.userId,
						name: p.user?.name,
						email: p.user?.email,
						role: p.user?.role,
						staffType: p.staffType,
						assignments: p.assignments.map((a) => a.property)
					})),
				total: totalCount.length,
				page,
				pageSize,
				totalPages: Math.ceil(totalCount.length / pageSize)
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
	if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

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
	if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

	await db.update(staffProfiles).set({ staffType }).where(eq(staffProfiles.id, id));
	await getStaff({}).refresh();
	return { success: true };
});

export const deleteStaff = form(z.object({ id: z.string() }), async ({ id }) => {
	const { sessionUser } = getSession();
	if (sessionUser.role !== 'admin') throw error(403, 'Forbidden');

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
