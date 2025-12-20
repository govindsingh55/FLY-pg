import { db } from '../src/lib/server/db';
import { electricityReadings } from '../src/lib/server/db/schema';
import { desc } from 'drizzle-orm';

async function main() {
	console.log("Testing user's orderBy syntax...");

	try {
		console.log("1. Object OrderBy Syntax { createdAt: 'desc' }");
		// @ts-ignore - bypassing TS to test runtime behavior of what user wrote
		await db.query.electricityReadings.findMany({
			with: { payment: true },
			orderBy: { createdAt: 'desc' },
			limit: 1
		});
		console.log('-> Success');
	} catch (e) {
		console.log('-> Failed', e.code, e.message);
	}
}

main();
