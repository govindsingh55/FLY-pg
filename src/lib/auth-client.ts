import { createAuthClient } from 'better-auth/svelte';
import { adminClient } from 'better-auth/client/plugins';
import {
	ac,
	adminRole,
	managerRole,
	propertyManagerRole,
	staffRole,
	customerRole
} from '$lib/permissions';
import { browser } from '$app/environment';

export const authClient = createAuthClient({
	baseURL: browser ? window.location.origin : undefined,
	plugins: [
		adminClient({
			ac,
			roles: {
				admin: adminRole,
				manager: managerRole,
				property_manager: propertyManagerRole,
				staff: staffRole,
				customer: customerRole
			}
		})
	]
});
