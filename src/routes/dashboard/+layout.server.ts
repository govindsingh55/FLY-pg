import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		throw redirect(303, '/login');
	}

	// Dashboard is customer-only (staff/admin use /admin)
	if (session.user.role !== 'customer') {
		throw redirect(303, '/admin');
	}

	return {
		user: session.user,
		session: session.session
	};
};
