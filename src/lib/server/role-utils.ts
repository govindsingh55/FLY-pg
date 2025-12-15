import { error } from '@sveltejs/kit';
import type { User } from 'better-auth';
import { db } from './db';

/**
 * Verifies if a user has access to a specific property.
 * Admns/Managers have access to all.
 * Property Managers/Staff must be assigned.
 */
export async function ensurePropertyAccess(user: User & { role: string }, propertyId: string) {
	if (!user) throw error(401, 'Unauthorized');

	if (user.role === 'admin' || user.role === 'manager') return true;

	if (user.role === 'property_manager') {
		const assignment = await db.query.propertyManagerAssignments.findFirst({
			where: {
				AND: [{ userId: user.id }, { propertyId: propertyId }]
			}
		});
		if (!assignment) throw error(403, 'You are not assigned to manage this property');
		return true;
	}

	if (user.role === 'staff') {
		// First get staff profile
		const staffProfile = await db.query.staffProfiles.findFirst({
			where: {
				AND: [{ userId: user.id }, { deletedAt: { isNull: true } }]
			}
		});

		if (!staffProfile) throw error(403, 'Staff profile not found');

		const assignment = await db.query.staffAssignments.findFirst({
			where: {
				AND: [{ staffProfileId: staffProfile.id }, { propertyId: propertyId }]
			}
		});

		if (!assignment) throw error(403, 'You are not assigned to this property');
		return true;
	}

	// Customers? Usually have access if they have a booking, but that's a different check.
	// Default deny for others
	throw error(403, 'Forbidden');
}

/**
 * Checks if a specific system setting allows an action.
 */
export async function checkSystemSetting(key: string, expectedValue: unknown) {
	const setting = await db.query.systemSettings.findFirst({
		where: {
			settingKey: key
		}
	});

	// If setting doesn't exist, assume false/disabled
	if (!setting) return false;

	// Handle JSON value comparison
	// Assuming simple boolean or string values for now
	return setting.settingValue === expectedValue;
}

/**
 * Checks if a manager is allowed to delete data.
 */
export async function canManagerDelete() {
	return await checkSystemSetting('allow_manager_delete', true);
}
