import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { db } from './db/index.js';
import { admin } from 'better-auth/plugins';
import {
	ac,
	adminRole,
	managerRole,
	propertyManagerRole,
	staffRole,
	customerRole
} from '../permissions';

const isDev = process.env.NODE_ENV === 'development';

// Standalone auth instance without SvelteKit dependencies
// Used for scripts that run outside the SvelteKit context
export const authForScripts = betterAuth({
	database: drizzleAdapter(db, { provider: 'sqlite' }),
	emailAndPassword: {
		enabled: true,
		disableSignUp: false,
		requireEmailVerification: !isDev,
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
				property_manager: propertyManagerRole,
				staff: staffRole,
				customer: customerRole
			},
			defaultRole: 'customer',
			impersonationSessionDuration: 60 * 60,
			bannedUserMessage: 'Your account has been suspended. Please contact support.',
			allowImpersonatingAdmins: false
		})
	]
});
