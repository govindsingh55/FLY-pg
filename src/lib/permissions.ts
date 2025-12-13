import { createAccessControl } from 'better-auth/plugins/access';

// Define access control
export const ac = createAccessControl({
	user: ['view', 'update'],
	property: ['view', 'create', 'update', 'delete'],
	room: ['view', 'create', 'update', 'delete'],
	customer: ['view', 'create', 'update', 'delete'],
	booking: ['view', 'create', 'update', 'delete', 'cancel'],
	payment: ['view', 'create', 'update'],
	ticket: ['view', 'create', 'update', 'delete', 'assign']
});

// Define role permissions
export const adminRole = ac.newRole({
	user: ['view', 'update'],
	property: ['view', 'create', 'update', 'delete'],
	room: ['view', 'create', 'update', 'delete'],
	customer: ['view', 'create', 'update', 'delete'],
	booking: ['view', 'create', 'update', 'delete', 'cancel'],
	payment: ['view', 'create', 'update'],
	ticket: ['view', 'create', 'update', 'delete', 'assign']
});

export const managerRole = ac.newRole({
	user: ['view'],
	property: ['view', 'create', 'update'],
	room: ['view', 'create', 'update'],
	customer: ['view', 'create', 'update'],
	booking: ['view', 'create', 'update', 'cancel'],
	payment: ['view', 'create'],
	ticket: ['view', 'update', 'assign']
});

export const staffRole = ac.newRole({
	user: ['view'],
	property: ['view'],
	room: ['view'],
	customer: ['view'],
	booking: ['view'],
	payment: ['view'],
	ticket: ['view', 'update']
});

export const customerRole = ac.newRole({
	user: ['view', 'update'],
	property: ['view'],
	room: ['view'],
	customer: [],
	booking: ['view'],
	payment: ['view'],
	ticket: ['view', 'create']
});
