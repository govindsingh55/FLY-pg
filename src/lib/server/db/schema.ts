import { defineRelations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

// --- Auth Tables ---

export const user = sqliteTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: integer('email_verified', { mode: 'boolean' }).default(false).notNull(),
	image: text('image'),
	role: text('role', { enum: ['admin', 'manager', 'staff', 'customer'] }).default('customer'),
	banned: integer('banned', { mode: 'boolean' }).default(false),
	banReason: text('ban_reason'),
	banExpires: integer('ban_expires', { mode: 'timestamp_ms' }),
	createdAt: integer('created_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
		.default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull()
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
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
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
	status: text('status', { enum: ['available', 'occupied', 'maintenance'] }).default('available'),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
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
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
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
	status: text('status', { enum: ['pending', 'active', 'completed', 'cancelled'] }).default(
		'pending'
	),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
});

export const payments = sqliteTable('payments', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	bookingId: text('booking_id').references(() => bookings.id),
	customerId: text('customer_id').references(() => customers.id),
	amount: integer('amount').notNull(),
	type: text('type', { enum: ['rent', 'security_deposit', 'maintenance', 'other'] }).notNull(),
	status: text('status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).default('pending'),
	transactionId: text('transaction_id'),
	paymentMethod: text('payment_method'),
	paymentDate: integer('payment_date', { mode: 'timestamp' }),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
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
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date())
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
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
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
		notifications
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
		}
	})
);
