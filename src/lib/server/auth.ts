import { betterAuth } from 'better-auth';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db';
import { admin } from 'better-auth/plugins';
import { ac, adminRole, managerRole, staffRole, customerRole } from '$lib/permissions';

const isDev = process.env.NODE_ENV === 'development';

export const auth = betterAuth({
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: {
		enabled: true,
		disableSignUp: false,
		requireEmailVerification: !isDev, // Only require email verification in production
		maxPasswordLength: 100,
		minPasswordLength: 6,
		maxEmailLength: 100,
		minEmailLength: 6
	},
	plugins: [
		admin({
			ac,
			roles: {
				admin: adminRole,
				manager: managerRole,
				staff: staffRole,
				customer: customerRole
			},
			defaultRole: 'customer',
			impersonationSessionDuration: 60 * 60, // 1 hour
			bannedUserMessage: 'Your account has been suspended. Please contact support.',
			allowImpersonatingAdmins: false
		}),
		sveltekitCookies(getRequestEvent)
	]
});
