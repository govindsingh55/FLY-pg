import { createAuthClient } from 'better-auth/svelte';
import { adminClient } from 'better-auth/client/plugins';
import { ac, adminRole, managerRole, staffRole, customerRole } from '$lib/permissions';

export const authClient = createAuthClient({
	baseURL: 'http://localhost:5173',
	plugins: [
		adminClient({
			ac,
			roles: {
				admin: adminRole,
				manager: managerRole,
				staff: staffRole,
				customer: customerRole
			}
		})
	]
});
