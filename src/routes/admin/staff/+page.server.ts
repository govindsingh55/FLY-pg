import { auth } from '$lib/server/auth';
import { db } from '$lib/server/db';
import { staffProfiles, user } from '$lib/server/db/schema';
import { softDelete } from '$lib/server/db/soft-delete';
import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ locals }) => {
	const session = await locals.session;
	const sessionUser = await locals.user;
	if (!session || sessionUser?.role !== 'admin') {
		throw redirect(302, '/login');
	}

	const staffList = await db.query.staffProfiles.findMany({
		where: { deletedAt: { isNull: true } },
		with: {
			user: true,
			assignments: {
				with: {
					property: true
				}
			}
		}
	});

	// Transform for UI
	const staff = staffList
		.filter((p) => p.user && p.user != null)
		.map((p) => ({
			id: p.id,
			userId: p.userId,
			name: p.user?.name,
			email: p.user?.email,
			role: p.user?.role, // Should be 'staff'
			staffType: p.staffType,
			assignments: p.assignments.map((a) => a.property)
		}));

	return { staff };
};

export const actions = {
	create: async ({ request, locals }) => {
		const session = await locals.session;
		const sessionUser = await locals.user;
		if (!session || sessionUser?.role !== 'admin') return fail(401);

		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;
		const password = data.get('password') as string;
		const staffType = data.get('staffType') as 'chef' | 'janitor' | 'security';

		if (!name || !email || !password || !staffType) {
			return fail(400, { message: 'Missing required fields' });
		}

		try {
			// 1. Create User via Better-Auth
			// using local API call to signUp or create user
			// Since we are admin, we might need a specific 'admin create user' API or just signUp
			const newUser = await auth.api.signUpEmail({
				body: {
					email,
					password,
					name
				}
			});

			if (!newUser) {
				return fail(500, { message: 'Failed to create user' });
			}
			await db.update(user).set({
				role: 'staff'
			});
			// 2. Create Staff Profile
			await db.insert(staffProfiles).values({
				userId: newUser.user.id,
				staffType
			});

			return { success: true };
		} catch (error) {
			console.error(error);
			return fail(500, { message: 'Error creating staff' });
		}
	},

	update: async ({ request, locals }) => {
		const session = await locals.session;
		const sessionUser = await locals.user;
		if (!session || sessionUser?.role !== 'admin') return fail(401);

		const data = await request.formData();
		const staffId = data.get('id') as string;
		const staffType = data.get('staffType') as 'chef' | 'janitor' | 'security';
		// Maybe update name/email via auth api too? For now just profile.

		if (!staffId || !staffType) return fail(400);

		await db.update(staffProfiles).set({ staffType }).where(eq(staffProfiles.id, staffId));

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const session = await locals.session;
		const sessionUser = await locals.user;
		if (!session || sessionUser?.role !== 'admin') return fail(401);

		const data = await request.formData();
		const staffId = data.get('id') as string;

		if (!staffId) return fail(400);

		// Soft delete the profile
		await db
			.update(staffProfiles)
			.set(softDelete(sessionUser?.id))
			.where(eq(staffProfiles.id, staffId));

		// Also soft delete the user?
		// Logic: if we delete the staff profile, the user might still exist as a regular user or should be banned?
		// Prompt says "add soft delete to all tables".
		// Let's get the userId from profile first
		const profile = await db.query.staffProfiles.findFirst({
			where: {
				id: staffId
			},
			columns: { userId: true }
		});

		if (profile) {
			await db.update(user).set(softDelete(sessionUser.id)).where(eq(user.id, profile.userId));
		}

		return { success: true };
	}
};
