import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import * as schema from './schema';
import { relationsDef } from './schema';

if (!process.env.DB_FILE_NAME) {
	throw new Error('DB_FILE_NAME is not set');
}

const db = drizzle(process.env.DB_FILE_NAME, { schema, relations: relationsDef });

export { db };
