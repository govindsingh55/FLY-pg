import { defineRelations, sql } from 'drizzle-orm';
import { sqliteTable, text, integer, index, primaryKey, real } from 'drizzle-orm/sqlite-core';

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

export const amenities = sqliteTable('amenities', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	description: text('description'),
	image: text('image'), // URL
	icon: text('icon') // lucide icon name
});

export const media = sqliteTable('media', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	url: text('url').notNull(),
	type: text('type').notNull(), // 'image' | 'video' | 'document'
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

export const propertyMedia = sqliteTable(
	'property_media',
	{
		propertyId: text('property_id')
			.notNull()
			.references(() => properties.id, { onDelete: 'cascade' }),
		mediaId: text('media_id')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' }),
		isFeatured: integer('is_featured', { mode: 'boolean' }).default(false)
	},
	(t) => ({
		pk: primaryKey({ columns: [t.propertyId, t.mediaId] })
	})
);

export const roomMedia = sqliteTable(
	'room_media',
	{
		roomId: text('room_id')
			.notNull()
			.references(() => rooms.id, { onDelete: 'cascade' }),
		mediaId: text('media_id')
			.notNull()
			.references(() => media.id, { onDelete: 'cascade' })
	},
	(t) => ({
		pk: primaryKey({ columns: [t.roomId, t.mediaId] })
	})
);

export const propertyAmenities = sqliteTable(
	'property_amenities',
	{
		propertyId: text('property_id')
			.notNull()
			.references(() => properties.id, { onDelete: 'cascade' }),
		amenityId: text('amenity_id')
			.notNull()
			.references(() => amenities.id, { onDelete: 'cascade' })
	},
	(t) => ({
		pk: primaryKey({ columns: [t.propertyId, t.amenityId] })
	})
);

export const properties = sqliteTable('properties', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	name: text('name').notNull(),
	description: text('description'),
	address: text('address').notNull(),
	sector: text('sector'),
	city: text('city').notNull(),
	state: text('state').notNull(),
	zip: text('zip').notNull(),
	lat: real('lat'),
	lng: real('lng'),
	// Nearby text or JSON
	nearby: text('nearby', { mode: 'json' }),
	contactPhone: text('contact_phone'),
	isFoodServiceAvailable: integer('is_food_service_available', { mode: 'boolean' }).default(false),
	// Optional food menu URL/file
	foodMenu: text('food_menu'),
	electricityUnitCost: real('electricity_unit_cost').default(0),
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
	features: text('features', { mode: 'json' }), // JSON array of strings
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
		.references(() => properties.id, { onDelete: 'cascade' }),
	roomId: text('room_id')
		.notNull()
		.references(() => rooms.id, { onDelete: 'cascade' }),
	customerId: text('customer_id')
		.notNull()
		.references(() => customers.id, { onDelete: 'cascade' }),
	status: text('status', { enum: ['pending', 'confirmed', 'cancelled', 'completed'] })
		.default('pending')
		.notNull(),
	bookingCharge: integer('booking_charge').notNull().default(0),
	paymentStatus: text('payment_status', { enum: ['pending', 'paid', 'refunded'] })
		.default('pending')
		.notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull(),
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
		enum: ['rent', 'security_deposit', 'maintenance', 'booking_charge', 'electricity', 'other']
	}).notNull(),
	status: text('status', { enum: ['pending', 'paid', 'failed', 'refunded'] }).default('pending'),
	mode: text('mode', { enum: ['cash', 'online', 'upi'] }).default('online'),
	transactionId: text('transaction_id'),
	paymentMethod: text('payment_method'),
	paymentDate: integer('payment_date', { mode: 'timestamp' }),
	contractId: text('contract_id').references(() => contracts.id),
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
	propertyId: text('property_id').references(() => properties.id),
	roomId: text('room_id').references(() => rooms.id),
	subject: text('subject').notNull(),
	type: text('type', { enum: ['electricity', 'plumbing', 'furniture', 'wifi', 'other'] }).notNull(),
	description: text('description').notNull(),
	status: text('status', { enum: ['open', 'in_progress', 'resolved', 'closed'] }).default('open'),
	priority: text('priority', { enum: ['low', 'medium', 'high'] }).default('medium'),
	assignedTo: text('assigned_to').references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const ticketMessages = sqliteTable('ticket_messages', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	ticketId: text('ticket_id')
		.notNull()
		.references(() => tickets.id, { onDelete: 'cascade' }),
	senderId: text('sender_id')
		.notNull()
		.references(() => user.id),
	content: text('content').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(unixepoch())`)
});

export const notifications = sqliteTable('notifications', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	userId: text('user_id').references(() => user.id), // Recipient
	senderId: text('sender_id').references(() => user.id), // Sender (admin/manager)
	title: text('title'),
	message: text('message').notNull(),
	type: text('type', {
		enum: ['info', 'warning', 'success', 'error', 'rent', 'electricity', 'general']
	}).default('info'),
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

export const contracts = sqliteTable('contracts', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	customerId: text('customer_id')
		.notNull()
		.references(() => customers.id, { onDelete: 'cascade' }),
	propertyId: text('property_id')
		.notNull()
		.references(() => properties.id, { onDelete: 'cascade' }),
	roomId: text('room_id')
		.notNull()
		.references(() => rooms.id, { onDelete: 'cascade' }),
	bookingId: text('booking_id')
		.unique()
		.references(() => bookings.id, { onDelete: 'cascade' }),
	contractType: text('contract_type', {
		enum: ['rent', 'lease', 'other']
	})
		.default('rent')
		.notNull(),
	startDate: integer('start_date', { mode: 'timestamp' }).notNull(),
	endDate: integer('end_date', { mode: 'timestamp' }), // Nullable for indefinite or month-to-month
	rentAmount: integer('rent_amount').notNull(),
	securityDeposit: integer('security_deposit'),
	includeFood: integer('include_food', { mode: 'boolean' }).default(false),
	status: text('status', { enum: ['active', 'expired', 'terminated'] })
		.default('active')
		.notNull(),
	terminationDate: integer('termination_date', { mode: 'timestamp' }),
	terminationReason: text('termination_reason'),
	notes: text('notes'),
	documentUrl: text('document_url'), // Link to the contract document
	createdBy: text('created_by').references(() => user.id),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.default(sql`(unixepoch())`)
		.notNull(),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
	deletedAt: integer('deleted_at', { mode: 'timestamp' }),
	deletedBy: text('deleted_by')
});

export const electricityReadings = sqliteTable(
	'electricity_readings',
	{
		id: text('id')
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		contractId: text('contract_id')
			.notNull()
			.references(() => contracts.id, { onDelete: 'cascade' }),
		propertyId: text('property_id')
			.notNull()
			.references(() => properties.id, { onDelete: 'cascade' }),
		roomId: text('room_id')
			.notNull()
			.references(() => rooms.id, { onDelete: 'cascade' }),
		customerId: text('customer_id')
			.notNull()
			.references(() => customers.id, { onDelete: 'cascade' }),
		readingDate: integer('reading_date', { mode: 'timestamp' }).notNull(),
		month: integer('month').notNull(), // 1-12
		year: integer('year').notNull(),
		unitsConsumed: real('units_consumed').notNull(),
		unitCost: real('unit_cost').notNull(),
		totalAmount: real('total_amount').notNull(),
		note: text('note'), // Optional note
		paymentId: text('payment_id').references(() => payments.id),
		createdBy: text('created_by').references(() => user.id),
		createdAt: integer('created_at', { mode: 'timestamp' })
			.default(sql`(unixepoch())`)
			.notNull(),
		updatedAt: integer('updated_at', { mode: 'timestamp' }).$onUpdate(() => new Date()),
		deletedAt: integer('deleted_at', { mode: 'timestamp' }),
		deletedBy: text('deleted_by')
	},
	(t) => ({
		unq: index('electricity_readings_unq').on(t.contractId, t.month, t.year)
	})
);

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
		foodMenuItems,
		media,
		propertyMedia,
		roomMedia,
		amenities,
		propertyAmenities,
		contracts,
		ticketMessages,
		electricityReadings
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
			contracts: r.many.contracts({
				from: r.user.id,
				to: r.contracts.createdBy
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
			}),
			propertyMedia: r.many.propertyMedia({
				from: r.properties.id,
				to: r.propertyMedia.propertyId
			}),
			amenities: r.many.propertyAmenities({
				from: r.properties.id,
				to: r.propertyAmenities.propertyId
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
			}),
			roomMedia: r.many.roomMedia({
				from: r.rooms.id,
				to: r.roomMedia.roomId
			})
		},
		media: {
			propertyMedia: r.many.propertyMedia({
				from: r.media.id,
				to: r.propertyMedia.mediaId
			}),
			roomMedia: r.many.roomMedia({
				from: r.media.id,
				to: r.roomMedia.mediaId
			})
		},
		propertyMedia: {
			property: r.one.properties({
				from: r.propertyMedia.propertyId,
				to: r.properties.id
			}),
			media: r.one.media({
				from: r.propertyMedia.mediaId,
				to: r.media.id
			})
		},
		roomMedia: {
			room: r.one.rooms({
				from: r.roomMedia.roomId,
				to: r.rooms.id
			}),
			media: r.one.media({
				from: r.roomMedia.mediaId,
				to: r.media.id
			})
		},
		amenities: {
			properties: r.many.propertyAmenities({
				from: r.amenities.id,
				to: r.propertyAmenities.amenityId
			})
		},
		propertyAmenities: {
			property: r.one.properties({
				from: r.propertyAmenities.propertyId,
				to: r.properties.id
			}),
			amenity: r.one.amenities({
				from: r.propertyAmenities.amenityId,
				to: r.amenities.id
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
			customer: r.one.customers({
				from: r.bookings.customerId,
				to: r.customers.id
			}),
			property: r.one.properties({
				from: r.bookings.propertyId,
				to: r.properties.id
			}),
			room: r.one.rooms({
				from: r.bookings.roomId,
				to: r.rooms.id
			}),
			payments: r.many.payments({
				from: r.bookings.id,
				to: r.payments.bookingId
			}),
			contract: r.one.contracts({
				from: r.bookings.id,
				to: r.contracts.bookingId
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
			}),
			contract: r.one.contracts({
				from: r.payments.contractId,
				to: r.contracts.id
			})
		},
		tickets: {
			customer: r.one.customers({
				from: r.tickets.customerId,
				to: r.customers.id
			}),
			property: r.one.properties({
				from: r.tickets.propertyId,
				to: r.properties.id
			}),
			room: r.one.rooms({
				from: r.tickets.roomId,
				to: r.rooms.id
			}),
			assignedStaff: r.one.user({
				from: r.tickets.assignedTo,
				to: r.user.id
			}),
			messages: r.many.ticketMessages({
				from: r.tickets.id,
				to: r.ticketMessages.ticketId
			})
		},
		ticketMessages: {
			ticket: r.one.tickets({
				from: r.ticketMessages.ticketId,
				to: r.tickets.id
			}),
			sender: r.one.user({
				from: r.ticketMessages.senderId,
				to: r.user.id
			})
		},
		notifications: {
			user: r.one.user({
				from: r.notifications.userId,
				to: r.user.id
			}),
			sender: r.one.user({
				from: r.notifications.senderId,
				to: r.user.id
			})
		},
		electricityReadings: {
			contract: r.one.contracts({
				from: r.electricityReadings.contractId,
				to: r.contracts.id
			}),
			property: r.one.properties({
				from: r.electricityReadings.propertyId,
				to: r.properties.id
			}),
			room: r.one.rooms({
				from: r.electricityReadings.roomId,
				to: r.rooms.id
			}),
			customer: r.one.customers({
				from: r.electricityReadings.customerId,
				to: r.customers.id
			}),
			payment: r.one.payments({
				from: r.electricityReadings.paymentId,
				to: r.payments.id
			}),
			creator: r.one.user({
				from: r.electricityReadings.createdBy,
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
		},
		contracts: {
			booking: r.one.bookings({
				from: r.contracts.bookingId,
				to: r.bookings.id
			}),
			customer: r.one.customers({
				from: r.contracts.customerId,
				to: r.customers.id
			}),
			property: r.one.properties({
				from: r.contracts.propertyId,
				to: r.properties.id
			}),
			room: r.one.rooms({
				from: r.contracts.roomId,
				to: r.rooms.id
			}),
			payments: r.many.payments({
				from: r.contracts.id,
				to: r.payments.contractId
			})
		}
	})
);
