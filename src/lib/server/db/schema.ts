import { defineRelations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// --- Auth Tables ---

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
	image: text('image'),
	role: text('role', {
		enum: ['admin', 'manager', 'property_manager', 'staff', 'customer']
	}).default('customer'),
	banned: integer('banned', { mode: 'boolean' }).default(false),
	banReason: text('ban_reason'),
	banExpires: integer('ban_expires', { mode: 'timestamp_ms' }),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const session = sqliteTable(
	'session',
	{
		id: text('id').primaryKey(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		token: text('token').notNull().unique(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: text('ip_address'),
		userAgent: text('user_agent'),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		impersonatedBy: text('impersonated_by')
	},
	(table) => [index('session_userId_idx').on(table.userId)]
);

export const account = sqliteTable(
	'account',
	{
		id: text('id').primaryKey(),
		accountId: text('account_id').notNull(),
		providerId: text('provider_id').notNull(),
		userId: text('user_id')
			.notNull()
			.references(() => user.id, { onDelete: 'cascade' }),
		accessToken: text('access_token'),
		refreshToken: text('refresh_token'),
		idToken: text('id_token'),
		accessTokenExpiresAt: integer('access_token_expires_at', {
			mode: 'timestamp_ms'
		}),
		refreshTokenExpiresAt: integer('refresh_token_expires_at', {
			mode: 'timestamp_ms'
		}),
		scope: text('scope'),
		password: text('password'),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('account_userId_idx').on(table.userId)]
);

export const verification = sqliteTable(
	'verification',
	{
		id: text('id').primaryKey(),
		identifier: text('identifier').notNull(),
		value: text('value').notNull(),
		expiresAt: integer('expires_at', { mode: 'timestamp_ms' }).notNull(),
		createdAt: integer('created_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
			.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull()
	},
	(table) => [index('verification_identifier_idx').on(table.identifier)]
);

// --- Business Domain Tables ---

export const properties = sqliteTable('properties', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	description: text('description'),
	address: text('address').notNull(),
	city: text('city'),
	state: text('state'),
	zip: text('zip'),
	amenities: text('amenities', { mode: 'json' }), // JSON array of strings
	images: text('images', { mode: 'json' }), // JSON array of URLs
	contactPhone: text('contact_phone'),
	isFoodServiceAvailable: integer('is_food_service_available', { mode: 'boolean' }).default(false),
	bookingCharge: integer('booking_charge').default(0),
	status: text('status', { enum: ['draft', 'published'] }).default('draft'),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const rooms = sqliteTable('rooms', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	propertyId: text('property_id')
		.notNull()
		.references(() => properties.id, { onDelete: 'cascade' }),
	number: text('number').notNull(),
	type: text('type', { enum: ['single', 'double', 'triple', 'dorm'] }).notNull(),
	capacity: integer('capacity'),
	priceMonthly: integer('price_monthly').notNull(),
	depositAmount: integer('deposit_amount'),
	features: text('features', { mode: 'json' }),
	images: text('images', { mode: 'json' }), // JSON array of URLs
	status: text('status', { enum: ['available', 'occupied', 'maintenance'] }).default('available'),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const customers = sqliteTable('customers', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').references(() => user.id), // Link to auth user if they have an account
	name: text('name').notNull(),
	email: text('email').notNull(),
	phone: text('phone').notNull(),
	addressPermanent: text('address_permanent'),
	idProofType: text('id_proof_type'),
	idProofNumber: text('id_proof_number'),
	idProofImage: text('id_proof_image'),
	emergencyContactName: text('emergency_contact_name'),
	emergencyContactPhone: text('emergency_contact_phone'),
	status: text('status', { enum: ['active', 'inactive'] }).default('active'),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const bookings = sqliteTable('bookings', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	propertyId: text('property_id')
		.notNull()
		.references(() => properties.id),
	roomId: text('room_id')
		.notNull()
		.references(() => rooms.id),
	customerId: text('customer_id')
		.notNull()
		.references(() => customers.id),
	startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
	endDate: integer('end_date', { mode: 'timestamp' }), // Nullable for indefinite? Or enforce contract end
	rentAmount: integer('rent_amount').notNull(),
	securityDeposit: integer('security_deposit'),
	includeFood: integer('include_food', { mode: 'boolean' }).default(false),
	status: text('status', { enum: ['pending', 'active', 'completed', 'cancelled'] }).default(
		'pending'
	),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const payments = sqliteTable('payments', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	bookingId: text('booking_id').references(() => bookings.id),
	customerId: text('customer_id').references(() => customers.id),
	amount: integer('amount').notNull(),
	type: text('type', {
		enum: ['rent', 'security_deposit', 'maintenance', 'booking_charge', 'other']
	}).notNull(),
	status: text('status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).default('pending'),
	mode: text('mode', { enum: ['cash', 'online', 'upi'] }).default('online'),
	transactionId: text('transaction_id'),
	paymentMethod: text('payment_method'),
	paymentDate: integer('payment_date', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const tickets = sqliteTable('tickets', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	customerId: text('customer_id').references(() => customers.id),
	roomId: text('room_id').references(() => rooms.id),
	type: text('type', { enum: ['electricity', 'plumbing', 'furniture', 'wifi', 'other'] }).notNull(),
	description: text('description').notNull(),
	status: text('status', { enum: ['open', 'in_progress', 'resolved', 'closed'] }).default('open'),
	priority: text('priority', { enum: ['low', 'medium', 'high'] }).default('medium'),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const notifications = sqliteTable('notifications', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').references(() => user.id),
	title: text('title'),
	message: text('message').notNull(),
	type: text('type', { enum: ['info', 'warning', 'success', 'error'] }).default('info'),
	isRead: integer('is_read', { mode: 'boolean' }).default(false),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const staffProfiles = sqliteTable('staff_profiles', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	staffType: text('staff_type', { enum: ['chef', 'janitor', 'security'] }).notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const propertyManagerAssignments = sqliteTable('property_manager_assignments', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	propertyId: text('property_id')
		.notNull()
		.references(() => properties.id, { onDelete: 'cascade' }),
	assignedAt: integer('assigned_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	assignedBy: text('assigned_by')
});

export const staffAssignments = sqliteTable('staff_assignments', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	staffProfileId: text('staff_profile_id')
		.notNull()
		.references(() => staffProfiles.id, { onDelete: 'cascade' }),
	propertyId: text('property_id')
		.notNull()
		.references(() => properties.id, { onDelete: 'cascade' }),
	assignedAt: integer('assigned_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	assignedBy: text('assigned_by')
});

export const visitBookings = sqliteTable('visit_bookings', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	customerId: text('customer_id')
		.notNull()
		.references(() => customers.id, { onDelete: 'cascade' }),
	propertyId: text('property_id')
		.notNull()
		.references(() => properties.id, { onDelete: 'cascade' }),
	visitDate: integer('visit_date', { mode: 'timestamp' }).notNull(),
	visitTime: integer('visit_time', { mode: 'timestamp' }).notNull(),
	status: text('status', { enum: ['pending', 'accepted', 'cancelled'] })
		.default('pending')
		.notNull(),
	cancelReason: text('cancel_reason'),
	cancelledBy: text('cancelled_by'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const systemSettings = sqliteTable('system_settings', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	settingKey: text('setting_key').notNull().unique(),
	settingValue: text('setting_value', { mode: 'json' }).notNull(),
	updatedBy: text('updated_by'),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.$onUpdate(() => new Date())
});

export const foodMenuItems = sqliteTable('food_menu_items', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	propertyId: text('property_id')
		.notNull()
		.references(() => properties.id, { onDelete: 'cascade' }),
	category: text('category', {
		enum: ['breakfast', 'lunch', 'dinner', 'snacks']
	}).notNull(),
	name: text('name').notNull(),
	description: text('description'),
	isVegetarian: integer('is_vegetarian', { mode: 'boolean' }).default(true),
	isAvailable: integer('is_available', { mode: 'boolean' }).default(true),
	price: integer('price'), // Optional if included in rent
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

// --- Relations ---

export const relationsDef = defineRelations(
	{
		user,
		session,
		account,
		verification,
		properties,
		rooms,
		customers,
		bookings,
		payments,
		tickets,
		notifications,
		staffProfiles,
		propertyManagerAssignments,
		staffAssignments,
		visitBookings,
		systemSettings,
		foodMenuItems
	},
	(r) => ({
		user: {
			sessions: r.many.session({
				from: r.user.id,
				to: r.session.userId
			}),
			accounts: r.many.account({
				from: r.user.id,
				to: r.account.userId
			}),
			customerProfile: r.one.customers({
				from: r.user.id,
				to: r.customers.userId
			}),
			staffProfile: r.one.staffProfiles({
				from: r.user.id,
				to: r.staffProfiles.userId
			}),
			propertyManagerAssignments: r.many.propertyManagerAssignments({
				from: r.user.id,
				to: r.propertyManagerAssignments.userId
			})
		},
		session: {
			user: r.one.user()
		},
		account: {
			user: r.one.user()
		},
		properties: {
			rooms: r.many.rooms({
				from: r.properties.id,
				to: r.rooms.propertyId
			}),
			managerAssignments: r.many.propertyManagerAssignments({
				from: r.properties.id,
				to: r.propertyManagerAssignments.propertyId
			}),
			staffAssignments: r.many.staffAssignments({
				from: r.properties.id,
				to: r.staffAssignments.propertyId
			}),
			foodMenuItems: r.many.foodMenuItems({
				from: r.properties.id,
				to: r.foodMenuItems.propertyId
			})
		},
		rooms: {
			property: r.one.properties({
				from: r.rooms.propertyId,
				to: r.properties.id
			}),
			bookings: r.many.bookings({
				from: r.rooms.id,
				to: r.bookings.roomId
			})
		},
		customers: {
			user: r.one.user({
				from: r.customers.userId,
				to: r.user.id
			}),
			bookings: r.many.bookings({
				from: r.customers.id,
				to: r.bookings.customerId
			}),
			payments: r.many.payments({
				from: r.customers.id,
				to: r.payments.customerId
			}),
			tickets: r.many.tickets({
				from: r.customers.id,
				to: r.tickets.customerId
			}),
			visitBookings: r.many.visitBookings({
				from: r.customers.id,
				to: r.visitBookings.customerId
			})
		},
		bookings: {
			property: r.one.properties({
				from: r.bookings.propertyId,
				to: r.properties.id
			}),
			room: r.one.rooms({
				from: r.bookings.roomId,
				to: r.rooms.id
			}),
			customer: r.one.customers({
				from: r.bookings.customerId,
				to: r.customers.id
			}),
			payments: r.many.payments({
				from: r.bookings.id,
				to: r.payments.bookingId
			})
		},
		payments: {
			booking: r.one.bookings({
				from: r.payments.bookingId,
				to: r.bookings.id
			}),
			customer: r.one.customers({
				from: r.payments.customerId,
				to: r.customers.id
			})
		},
		tickets: {
			customer: r.one.customers({
				from: r.tickets.customerId,
				to: r.customers.id
			}),
			room: r.one.rooms({
				from: r.tickets.roomId,
				to: r.rooms.id
			})
		},
		notifications: {
			user: r.one.user({
				from: r.notifications.userId,
				to: r.user.id
			})
		},
		staffProfiles: {
			user: r.one.user({
				from: r.staffProfiles.userId,
				to: r.user.id
			}),
			assignments: r.many.staffAssignments({
				from: r.staffProfiles.id,
				to: r.staffAssignments.staffProfileId
			})
		},
		propertyManagerAssignments: {
			user: r.one.user({
				from: r.propertyManagerAssignments.userId,
				to: r.user.id
			}),
			property: r.one.properties({
				from: r.propertyManagerAssignments.propertyId,
				to: r.properties.id
			})
		},
		staffAssignments: {
			staffProfile: r.one.staffProfiles({
				from: r.staffAssignments.staffProfileId,
				to: r.staffProfiles.id
			}),
			property: r.one.properties({
				from: r.staffAssignments.propertyId,
				to: r.properties.id
			})
		},
		visitBookings: {
			customer: r.one.customers({
				from: r.visitBookings.customerId,
				to: r.customers.id
			}),
			property: r.one.properties({
				from: r.visitBookings.propertyId,
				to: r.properties.id
			})
		},
		foodMenuItems: {
			property: r.one.properties({
				from: r.foodMenuItems.propertyId,
				to: r.properties.id
			})
		}
	})
);
