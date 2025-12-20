import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		throw redirect(303, '/login');
	}

	// Only staff can access /staff routes
	if (session.user.role !== 'staff') {
		// Redirect non-staff to their appropriate dashboard
		if (
			session.user.role === 'admin' ||
			session.user.role === 'manager' ||
			session.user.role === 'property_manager'
		) {
			throw redirect(303, '/admin');
		}
		// Redirect customers
		throw redirect(303, '/dashboard');
	}

	return {
		user: session.user,
		session: session.session
	};
};
