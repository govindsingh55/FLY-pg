import 'dotenv/config';
import { createRequire } from 'module';
import * as schema from './schema';
import { relationsDef } from './schema';

// Create a require function for loading native modules in ESM context
const require = createRequire(import.meta.url);

// Type for the database instance - we use any here because the type varies by driver
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DrizzleDB = any;

let _localDb: DrizzleDB | null = null;

/**
 * Get database instance for Cloudflare Workers.
 * Uses D1 binding from platform.env
 */
export function getDb(platform?: App.Platform): DrizzleDB {
	// Cloudflare Workers environment - use D1
	if (platform?.env?.DB) {
		const { drizzle: drizzleD1 } = require('drizzle-orm/d1');
		return drizzleD1(platform.env.DB, { schema, relations: relationsDef });
	}

	// Local development - return cached instance if available
	if (_localDb) return _localDb;

	throw new Error(
		'No database configuration found. For local dev use the `db` export, for Cloudflare provide platform.env.DB.'
	);
}

/**
 * Direct database export for local development.
 * Uses better-sqlite3 with the DB_FILE_NAME environment variable.
 *
 * Note: In Cloudflare Workers, use getDb(event.platform) instead.
 */
function createLocalDb(): DrizzleDB {
	if (_localDb) return _localDb;

	const dbFileName = process.env?.DB_FILE_NAME;
	if (!dbFileName) {
		// Return a proxy that errors if accessed without DB_FILE_NAME
		return new Proxy({} as DrizzleDB, {
			get(_, prop) {
				if (prop === 'then' || prop === Symbol.toStringTag) return undefined;
				throw new Error(
					'DB_FILE_NAME not set. Set it in .env for local development or use getDb(platform) in Cloudflare.'
				);
			}
		});
	}

	try {
		// Use require to load better-sqlite3 (native module)
		const Database = require('better-sqlite3');
		const { drizzle: drizzleSqlite } = require('drizzle-orm/better-sqlite3');

		const database = new Database(dbFileName);
		_localDb = drizzleSqlite(database, { schema, relations: relationsDef });
		return _localDb;
	} catch (e) {
		// If we can't load better-sqlite3, return a helpful error proxy
		console.error('Failed to load better-sqlite3:', e);
		return new Proxy({} as DrizzleDB, {
			get(_, prop) {
				if (prop === 'then' || prop === Symbol.toStringTag) return undefined;
				throw new Error(
					'Failed to initialize database. Ensure better-sqlite3 is installed for local development.'
				);
			}
		});
	}
}

// Export the db instance - works in local dev
export const db = createLocalDb();
