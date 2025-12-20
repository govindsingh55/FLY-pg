import { createAccessControl } from 'better-auth/plugins/access';
import { defaultStatements, adminAc } from 'better-auth/plugins/admin/access';

// Define access control - merge with default admin statements
export const ac = createAccessControl({
	...defaultStatements,
	// Note: defaultStatements includes 'user' and 'session' resources with admin actions
	// We keep them as-is to preserve impersonate, ban, set-role, etc.
	property: ['view', 'create', 'update', 'delete'],
	room: ['view', 'create', 'update', 'delete'],
	customer: ['view', 'create', 'update', 'delete'],
	booking: ['view', 'create', 'update', 'delete', 'cancel'],
	payment: ['view', 'create', 'update'],
	ticket: ['view', 'create', 'update', 'delete', 'assign'],
	visit_booking: ['view', 'create', 'update', 'delete', 'cancel', 'accept', 'reject'],
	system_settings: ['view', 'update'],
	staff_assignment: ['view', 'create', 'update', 'delete'],
	property_assignment: ['view', 'create', 'delete'],
	staff_profile: ['view', 'create', 'update', 'delete']
});

// Define role permissions - admin includes default admin permissions (including impersonate)
export const adminRole = ac.newRole({
	...adminAc.statements, // This includes user:impersonate, user:ban, user:create, etc.
	// Note: We don't override 'user' permissions here because adminAc.statements already provides
	// comprehensive admin permissions for the user resource including 'impersonate'
	property: ['view', 'create', 'update', 'delete'],
	room: ['view', 'create', 'update', 'delete'],
	customer: ['view', 'create', 'update', 'delete'],
	booking: ['view', 'create', 'update', 'delete', 'cancel'],
	payment: ['view', 'create', 'update'],
	ticket: ['view', 'create', 'update', 'delete', 'assign'],
	visit_booking: ['view', 'create', 'update', 'delete', 'cancel', 'accept', 'reject'],
	system_settings: ['view', 'update'],
	staff_assignment: ['view', 'create', 'update', 'delete'],
	property_assignment: ['view', 'create', 'delete'],
	staff_profile: ['view', 'create', 'update', 'delete']
});

export const managerRole = ac.newRole({
	user: ['get', 'list'],
	property: ['view', 'create', 'update', 'delete'], // Delete allowed in PERMISSION, logic handled in middleware via settings
	room: ['view', 'create', 'update', 'delete'],
	customer: ['view', 'create', 'update', 'delete'],
	booking: ['view', 'create', 'update', 'cancel'],
	payment: ['view', 'create'],
	ticket: ['view', 'update', 'assign'],
	visit_booking: ['view', 'update', 'accept', 'reject'],
	system_settings: ['view'],
	staff_assignment: ['view', 'create', 'update'],
	property_assignment: ['view'],
	staff_profile: ['view', 'create', 'update']
});

export const propertyManagerRole = ac.newRole({
	user: ['get'],
	property: ['view', 'update'],
	room: ['view', 'create', 'update'],
	customer: ['view', 'create', 'update'],
	booking: ['view', 'create', 'update', 'cancel'],
	payment: ['view', 'create'],
	ticket: ['view', 'update', 'assign'],
	visit_booking: ['view', 'update', 'accept', 'reject'],
	system_settings: [],
	staff_assignment: ['view'],
	property_assignment: [],
	staff_profile: ['view']
});

export const staffRole = ac.newRole({
	user: ['get'],
	property: ['view'],
	room: ['view'],
	customer: ['view'],
	booking: ['view'],
	payment: ['view'],
	ticket: ['view', 'update', 'assign'],
	visit_booking: ['view'],
	system_settings: [],
	staff_assignment: [],
	property_assignment: [],
	staff_profile: []
});

export const customerRole = ac.newRole({
	user: ['get', 'update'],
	property: ['view'],
	room: ['view'],
	customer: ['view'], // Can view their own profile
	booking: ['view'],
	payment: ['view'],
	ticket: ['view', 'create', 'update'], // Can cancel/update own ticket? usually just create
	visit_booking: ['view', 'create', 'cancel'],
	system_settings: [],
	staff_assignment: [],
	property_assignment: [],
	staff_profile: []
});
