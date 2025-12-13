import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		throw redirect(303, '/login');
	}

	// Check if user has admin role
	if (
		session.user.role !== 'admin' &&
		session.user.role !== 'manager' &&
		session.user.role !== 'staff'
	) {
		throw redirect(303, '/dashboard');
	}

	return {
		user: session.user
	};
};
