import { isNull } from 'drizzle-orm';
import * as schema from './schema';

/**
 * Returns a filter to exclude soft-deleted records.
 * Usage: db.query.table.findMany({ where: and(..., notDeleted) })
 */
export const notDeleted = isNull(schema.properties.deletedAt);
// Note: define specific notDeleted helpers if tables have different column names or if we want a generic one.
// Since all our tables use deletedAt, we can make a generic helper if we pass the table object,
// but Drizzle's modular nature often requires explicit column references.
// A common pattern is:
// export const notDeleted = (table: any) => isNull(table.deletedAt);

export const notDeletedFilter = () => ({ deletedAt: { isNull: true } });

/**
 * Returns the object to update for a soft delete.
 */
export const softDelete = (userId?: string) => ({
	deletedAt: new Date(),
	deletedBy: userId
});
