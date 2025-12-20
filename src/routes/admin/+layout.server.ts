import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const load = async ({ request }) => {
	const session = await auth.api.getSession({
		headers: request.headers
	});

	if (!session) {
		throw redirect(303, '/login');
	}

	// Only admin, manager, and property_manager can access /admin routes
	if (
		session.user.role !== 'admin' &&
		session.user.role !== 'manager' &&
		session.user.role !== 'property_manager'
	) {
		// Redirect staff to their own dashboard
		if (session.user.role === 'staff') {
			throw redirect(303, '/staff');
		}
		// Redirect customers to customer dashboard
		throw redirect(303, '/dashboard');
	}

	// Define role permissions for sub-routes (staff completely removed)
	const routePermissions: Record<string, string[]> = {
		'/admin/settings': ['admin', 'manager'],
		'/admin/staff': ['admin', 'manager'],
		'/admin/users': ['admin'],
		'/admin/customers': ['admin', 'manager', 'property_manager'],
		'/admin/properties': ['admin', 'manager', 'property_manager'],
		'/admin/bookings': ['admin', 'manager', 'property_manager'],
		'/admin/contracts': ['admin', 'manager', 'property_manager'],
		'/admin/payments': ['admin', 'manager', 'property_manager'],
		'/admin/tickets': ['admin', 'manager', 'property_manager'],
		'/admin/visits': ['admin', 'manager', 'property_manager'],
		'/admin/electricity': ['admin', 'manager', 'property_manager'],
		'/admin/amenities': ['admin', 'manager'],
		'/admin/media': ['admin', 'manager', 'property_manager'],
		'/admin/assignments': ['admin', 'manager']
	};

	const pathname = request.url ? new URL(request.url).pathname : '';

	// Check permissions for the current path
	for (const [route, roles] of Object.entries(routePermissions)) {
		if (pathname.startsWith(route)) {
			if (!roles.includes(session.user.role)) {
				// Redirect to a safe page with an error message
				throw redirect(303, '/admin?access_denied=true');
			}
		}
	}

	return {
		user: session.user,
		session: session.session
	};
};
