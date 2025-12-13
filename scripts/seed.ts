import { db } from '../src/lib/server/db/index.js';
import {
	user,
	account,
	session,
	verification,
	properties,
	rooms,
	customers,
	bookings,
	payments,
	tickets
} from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
	console.log('🌱 Starting database seed...');

	try {
		// Clear existing data first (including auth tables)
		console.log('🧹 Clearing existing data...');
		await db.delete(tickets);
		await db.delete(payments);
		await db.delete(bookings);
		await db.delete(customers);
		await db.delete(rooms);
		await db.delete(properties);
		await db.delete(session);
		await db.delete(verification);
		await db.delete(account);
		await db.delete(user);
		console.log('✅ Cleared existing data\n');

		// Import standalone auth instance (no SvelteKit dependencies)
		const { authForScripts: auth } = await import('../src/lib/server/auth-scripts.js');

		// Create users with different roles using better-auth API
		console.log('Creating users...\n');

		const testPassword = 'password123';

		// Helper function to create user with error handling
		async function createUser(
			name: string,
			email: string,
			role: 'admin' | 'manager' | 'staff' | 'customer'
		) {
			try {
				const result = await auth.api.signUpEmail({
					body: {
						name,
						email,
						password: testPassword
					}
				});

				const userId = result?.user?.id;
				if (userId && role !== 'customer') {
					// Update role for non-customer users
					await db.update(user).set({ role, emailVerified: true }).where(eq(user.id, userId));
				} else if (userId) {
					// Just verify email for customer users
					await db.update(user).set({ emailVerified: true }).where(eq(user.id, userId));
				}
				console.log(`✓ ${name} (${role})`);
				return userId;
			} catch (error: unknown) {
				if (
					(error as { body: { code: string } }).body?.code ===
					'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL'
				) {
					console.log(`⚠ ${name} already exists, skipping...`);
					// Try to find existing user
					const existingUser = await db.query.user.findFirst({
						where: {
							email
						}
					});
					return existingUser?.id;
				}
				throw error;
			}
		}

		await createUser('Admin User', 'admin@pms.local', 'admin');
		await createUser('Manager User', 'manager@pms.local', 'manager');
		await createUser('Staff User', 'staff@pms.local', 'staff');
		const customerUser1Id = await createUser('John Doe', 'john@example.com', 'customer');
		const customerUser2Id = await createUser('Jane Smith', 'jane@example.com', 'customer');

		console.log('\n✅ Users created with better-auth');

		// Create properties
		console.log('Creating properties...');
		const property1Id = crypto.randomUUID();
		const property2Id = crypto.randomUUID();

		await db.insert(properties).values([
			{
				id: property1Id,
				name: 'Sunrise Apartments',
				description: 'Modern apartments in the heart of the city',
				address: '123 Main Street',
				city: 'Mumbai',
				state: 'Maharashtra',
				zip: '400001',
				amenities: ['WiFi', 'Parking', 'Gym', 'Security'],
				images: ['/images/sunrise-1.jpg', '/images/sunrise-2.jpg'],
				contactPhone: '+91 9876543210',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: property2Id,
				name: 'Green Valley PG',
				description: 'Affordable PG accommodation for students and professionals',
				address: '456 College Road',
				city: 'Pune',
				state: 'Maharashtra',
				zip: '411001',
				amenities: ['WiFi', 'Meals', 'Laundry', 'AC'],
				images: ['/images/greenvalley-1.jpg'],
				contactPhone: '+91 9876543211',
				createdAt: new Date(),
				updatedAt: new Date()
			}
		]);

		console.log('✅ Properties created');

		// Create rooms
		console.log('Creating rooms...');
		const room1Id = crypto.randomUUID();
		const room2Id = crypto.randomUUID();
		const room3Id = crypto.randomUUID();
		const room4Id = crypto.randomUUID();

		await db.insert(rooms).values([
			{
				id: room1Id,
				propertyId: property1Id,
				number: '101',
				type: 'single',
				capacity: 1,
				priceMonthly: 15000,
				depositAmount: 15000,
				features: ['AC', 'Attached Bathroom', 'Balcony'],
				status: 'occupied',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: room2Id,
				propertyId: property1Id,
				number: '102',
				type: 'double',
				capacity: 2,
				priceMonthly: 20000,
				depositAmount: 20000,
				features: ['AC', 'Attached Bathroom'],
				status: 'available',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: room3Id,
				propertyId: property2Id,
				number: '201',
				type: 'triple',
				capacity: 3,
				priceMonthly: 25000,
				depositAmount: 12500,
				features: ['Fan', 'Shared Bathroom'],
				status: 'occupied',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: room4Id,
				propertyId: property2Id,
				number: '202',
				type: 'dorm',
				capacity: 6,
				priceMonthly: 8000,
				depositAmount: 5000,
				features: ['Fan', 'Shared Bathroom', 'Lockers'],
				status: 'available',
				createdAt: new Date(),
				updatedAt: new Date()
			}
		]);

		console.log('✅ Rooms created');

		// Create customers
		console.log('Creating customers...');
		const customer1Id = crypto.randomUUID();
		const customer2Id = crypto.randomUUID();

		await db.insert(customers).values([
			{
				id: customer1Id,
				userId: customerUser1Id!,
				name: 'John Doe',
				email: 'john@example.com',
				phone: '+91 9123456789',
				addressPermanent: '789 Park Avenue, Mumbai, 400002',
				idProofType: 'Aadhar Card',
				idProofNumber: '1234-5678-9012',
				idProofImage: null,
				emergencyContactName: 'Robert Doe',
				emergencyContactPhone: '+91 9123456788',
				status: 'active',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: customer2Id,
				userId: customerUser2Id!,
				name: 'Jane Smith',
				email: 'jane@example.com',
				phone: '+91 9234567890',
				addressPermanent: '321 Lake View, Pune, 411002',
				idProofType: 'Passport',
				idProofNumber: 'P1234567',
				idProofImage: null,
				emergencyContactName: 'Mary Smith',
				emergencyContactPhone: '+91 9234567891',
				status: 'active',
				createdAt: new Date(),
				updatedAt: new Date()
			}
		]);

		console.log('✅ Customers created');

		// Create bookings
		console.log('Creating bookings...');
		const booking1Id = crypto.randomUUID();
		const booking2Id = crypto.randomUUID();

		const now = new Date();
		const twoMonthsAgo = new Date(now);
		twoMonthsAgo.setMonth(now.getMonth() - 2);

		await db.insert(bookings).values([
			{
				id: booking1Id,
				propertyId: property1Id,
				roomId: room1Id,
				customerId: customer1Id,
				startDate: twoMonthsAgo,
				endDate: null, // Ongoing
				rentAmount: 15000,
				securityDeposit: 15000,
				status: 'active',
				createdAt: twoMonthsAgo,
				updatedAt: new Date()
			},
			{
				id: booking2Id,
				propertyId: property2Id,
				roomId: room3Id,
				customerId: customer2Id,
				startDate: twoMonthsAgo,
				endDate: null,
				rentAmount: 8333, // Split 3-way from 25000
				securityDeposit: 12500,
				status: 'active',
				createdAt: twoMonthsAgo,
				updatedAt: new Date()
			}
		]);

		console.log('✅ Bookings created');

		// Create payments
		console.log('Creating payments...');
		const oneMonthAgo = new Date(now);
		oneMonthAgo.setMonth(now.getMonth() - 1);

		await db.insert(payments).values([
			{
				id: crypto.randomUUID(),
				bookingId: booking1Id,
				customerId: customer1Id,
				amount: 15000,
				type: 'security_deposit',
				status: 'paid',
				transactionId: 'TXN001',
				paymentMethod: 'Bank Transfer',
				paymentDate: twoMonthsAgo,
				createdAt: twoMonthsAgo,
				updatedAt: twoMonthsAgo
			},
			{
				id: crypto.randomUUID(),
				bookingId: booking1Id,
				customerId: customer1Id,
				amount: 15000,
				type: 'rent',
				status: 'paid',
				transactionId: 'TXN002',
				paymentMethod: 'UPI',
				paymentDate: oneMonthAgo,
				createdAt: oneMonthAgo,
				updatedAt: oneMonthAgo
			},
			{
				id: crypto.randomUUID(),
				bookingId: booking1Id,
				customerId: customer1Id,
				amount: 15000,
				type: 'rent',
				status: 'paid',
				transactionId: 'TXN003',
				paymentMethod: 'UPI',
				paymentDate: now,
				createdAt: now,
				updatedAt: now
			},
			{
				id: crypto.randomUUID(),
				bookingId: booking2Id,
				customerId: customer2Id,
				amount: 12500,
				type: 'security_deposit',
				status: 'paid',
				transactionId: 'TXN004',
				paymentMethod: 'Cash',
				paymentDate: twoMonthsAgo,
				createdAt: twoMonthsAgo,
				updatedAt: twoMonthsAgo
			},
			{
				id: crypto.randomUUID(),
				bookingId: booking2Id,
				customerId: customer2Id,
				amount: 8333,
				type: 'rent',
				status: 'paid',
				transactionId: 'TXN005',
				paymentMethod: 'UPI',
				paymentDate: oneMonthAgo,
				createdAt: oneMonthAgo,
				updatedAt: oneMonthAgo
			}
		]);

		console.log('✅ Payments created');

		// Create tickets
		console.log('Creating tickets...');
		await db.insert(tickets).values([
			{
				id: crypto.randomUUID(),
				customerId: customer1Id,
				roomId: room1Id,
				type: 'plumbing',
				description:
					'Leaking tap in bathroom\n\nThe tap has been leaking for 2 days now. Please fix it soon.',
				status: 'open',
				priority: 'high',
				createdAt: now,
				updatedAt: now
			},
			{
				id: crypto.randomUUID(),
				customerId: customer2Id,
				roomId: room3Id,
				type: 'wifi',
				description: 'WiFi not working\n\nInternet connection is very slow since yesterday.',
				status: 'in_progress',
				priority: 'medium',
				createdAt: oneMonthAgo,
				updatedAt: now
			}
		]);

		console.log('✅ Tickets created');

		console.log('\n🎉 Database seeding completed successfully!');
		console.log('\n📝 Test Credentials (ready to use):');
		console.log('   Admin:    admin@pms.local    / password123');
		console.log('   Manager:  manager@pms.local  / password123');
		console.log('   Staff:    staff@pms.local    / password123');
		console.log('   Customer: john@example.com   / password123');
		console.log('   Customer: jane@example.com   / password123');
		console.log('\n✅ All users created via better-auth with working credentials!');
	} catch (error) {
		console.error('❌ Error seeding database:', error);
		throw error;
	}

	process.exit(0);
}

seed();
