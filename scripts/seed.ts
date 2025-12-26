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
	tickets,
	ticketMessages,
	staffProfiles,
	propertyManagerAssignments,
	visitBookings,
	systemSettings,
	staffAssignments,
	foodMenuItems,
	amenities,
	propertyAmenities,
	contracts,
	propertyMedia,
	roomMedia,
	media
} from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

async function seed() {
	console.log('🌱 Starting database seed...');

	try {
		// Clear new tables
		await db.delete(systemSettings);
		await db.delete(foodMenuItems);
		await db.delete(propertyAmenities);

		await db.delete(propertyMedia);
		await db.delete(roomMedia);
		await db.delete(media);
		await db.delete(visitBookings);
		await db.delete(staffAssignments);
		await db.delete(propertyManagerAssignments);
		await db.delete(staffProfiles);
		// Clear existing data first (including auth tables)
		console.log('🧹 Clearing existing data...');
		await db.delete(ticketMessages);
		await db.delete(tickets);
		await db.delete(contracts);
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
			role: 'admin' | 'manager' | 'property_manager' | 'staff' | 'customer'
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
		const propManagerId = await createUser(
			'Property Manager User',
			'propman@pms.local',
			'property_manager'
		);
		const staffUser1Id = await createUser('Chef Staff', 'chef@pms.local', 'staff');
		const staffUser2Id = await createUser('Janitor Staff', 'janitor@pms.local', 'staff');
		const customerUser1Id = await createUser('John Doe', 'john@example.com', 'customer');
		const customerUser2Id = await createUser('Jane Smith', 'jane@example.com', 'customer');

		console.log('\n✅ Users created with better-auth');

		// Create Amenities
		console.log('Creating amenities...');
		const amenityIds: Record<string, string> = {};
		const amenityList = [
			'WiFi',
			'Parking',
			'Gym',
			'Security',
			'Meals',
			'Laundry',
			'AC',
			'Fan',
			'Shared Bathroom',
			'Attached Bathroom',
			'Lockers',
			'Balcony'
		];

		for (const name of amenityList) {
			const id = crypto.randomUUID();
			amenityIds[name] = id;
			await db.insert(amenities).values({
				id,
				name,
				description: `${name} facility`,
				icon: 'check' // Default icon
			});
		}
		console.log('✅ Amenities created');

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
				sector: 'Sector 4',
				city: 'Mumbai',
				state: 'Maharashtra',
				zip: '400001',
				nearby: ['Metro Station', 'City Mall'], // JSON array
				contactPhone: '+91 9876543210',
				isFoodServiceAvailable: true,
				foodMenu: 'https://example.com/menu.pdf',
				bookingCharge: 1000,
				status: 'published',
				createdAt: new Date(),
				updatedAt: new Date()
			},
			{
				id: property2Id,
				name: 'Green Valley PG',
				description: 'Affordable PG accommodation for students and professionals',
				address: '456 College Road',
				sector: 'Sector 5',
				city: 'Pune',
				state: 'Maharashtra',
				zip: '411001',
				nearby: ['College Campus', 'Bus Stand'],
				contactPhone: '+91 9876543211',
				isFoodServiceAvailable: false,
				bookingCharge: 0,
				status: 'published',
				createdAt: new Date(),
				updatedAt: new Date()
			}
		]);

		// Link Amenities
		const prop1Amenities = ['WiFi', 'Parking', 'Gym', 'Security'];
		for (const am of prop1Amenities) {
			if (amenityIds[am]) {
				await db.insert(propertyAmenities).values({
					propertyId: property1Id,
					amenityId: amenityIds[am]
				});
			}
		}

		const prop2Amenities = ['WiFi', 'Meals', 'Laundry', 'AC'];
		for (const am of prop2Amenities) {
			if (amenityIds[am]) {
				await db.insert(propertyAmenities).values({
					propertyId: property2Id,
					amenityId: amenityIds[am]
				});
			}
		}

		// Create Property Media
		console.log('Creating Property Media...');
		const propMediaItems = [
			{ url: '/images/sunrise-1.jpg', type: 'image', propId: property1Id },
			{ url: '/images/sunrise-2.jpg', type: 'image', propId: property1Id },
			{ url: '/images/greenvalley-1.jpg', type: 'image', propId: property2Id }
		];

		const propMediaCounts: Record<string, number> = {};
		for (const item of propMediaItems) {
			const mId = crypto.randomUUID();
			await db.insert(media).values({
				id: mId,
				url: item.url,
				type: item.type
			});

			const count = propMediaCounts[item.propId] || 0;
			propMediaCounts[item.propId] = count + 1;

			await db.insert(propertyMedia).values({
				propertyId: item.propId,
				mediaId: mId,
				isFeatured: count === 0,
				order: count
			});
		}
		console.log('✅ Property Media Created');

		// Create food menu items
		console.log('Creating food menu items...');
		await db.insert(foodMenuItems).values([
			{
				propertyId: property1Id,
				category: 'breakfast',
				name: 'Idli Sambar',
				description: 'Steamed rice cakes with lentil soup',
				isVegetarian: true,
				isAvailable: true,
				price: 50
			},
			{
				propertyId: property1Id,
				category: 'breakfast',
				name: 'Masala Dosa',
				description: 'Crispy crepe with potato filling',
				isVegetarian: true,
				isAvailable: true,
				price: 70
			},
			{
				propertyId: property1Id,
				category: 'lunch',
				name: 'Veg Thali',
				description: 'Rice, Dal, 2 Sabzi, Roti, Curd',
				isVegetarian: true,
				isAvailable: true,
				price: 120
			},
			{
				propertyId: property1Id,
				category: 'lunch',
				name: 'Chicken Thali',
				description: 'Rice, Chicken Curry, Roti, Salad',
				isVegetarian: false,
				isAvailable: true,
				price: 180
			},
			{
				propertyId: property1Id,
				category: 'dinner',
				name: 'Dal Khichdi',
				description: 'Comfort food with lentils and rice',
				isVegetarian: true,
				isAvailable: true,
				price: 100
			}
		]);

		console.log('✅ Properties created');

		// Assign Property Manager to Property 1
		console.log('Assigning Property Manager...');
		await db.insert(propertyManagerAssignments).values({
			userId: propManagerId!,
			propertyId: property1Id,
			assignedBy: 'system'
		});
		console.log('✅ Property Manager Assigned');

		// Create Staff Profiles & Assignments
		console.log('Creating Staff Profiles...');
		const profile1Id = crypto.randomUUID();
		const profile2Id = crypto.randomUUID();

		await db.insert(staffProfiles).values([
			{
				id: profile1Id,
				userId: staffUser1Id!,
				staffType: 'chef'
			},
			{
				id: profile2Id,
				userId: staffUser2Id!,
				staffType: 'janitor'
			}
		]);

		await db.insert(staffAssignments).values([
			{
				staffProfileId: profile1Id,
				propertyId: property1Id,
				assignedBy: 'system'
			},
			{
				staffProfileId: profile2Id,
				propertyId: property2Id, // Janitor at Green Valley
				assignedBy: 'system'
			}
		]);
		console.log('✅ Staff Profiles & Assignments Created');

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

		// Create Room Media
		console.log('Creating Room Media...');
		const roomMediaItems = [
			{ url: '/images/room101-1.jpg', type: 'image', roomId: room1Id },
			{ url: '/images/room101-2.jpg', type: 'image', roomId: room1Id },
			{ url: '/images/room102.jpg', type: 'image', roomId: room2Id },
			{ url: '/images/room201.jpg', type: 'image', roomId: room3Id },
			{ url: '/images/room202.jpg', type: 'image', roomId: room4Id }
		];

		const roomMediaCounts: Record<string, number> = {};
		for (const item of roomMediaItems) {
			const mId = crypto.randomUUID();
			await db.insert(media).values({
				id: mId,
				url: item.url,
				type: item.type
			});

			const count = roomMediaCounts[item.roomId] || 0;
			roomMediaCounts[item.roomId] = count + 1;

			await db.insert(roomMedia).values({
				roomId: item.roomId,
				mediaId: mId,
				isFeatured: count === 0,
				order: count
			});
		}
		console.log('✅ Room Media Created');

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
				bookingCharge: 1000,
				status: 'confirmed',
				createdAt: twoMonthsAgo,
				updatedAt: new Date()
			},
			{
				id: booking2Id,
				propertyId: property2Id,
				roomId: room3Id,
				customerId: customer2Id,
				bookingCharge: 0,
				status: 'confirmed',
				createdAt: twoMonthsAgo,
				updatedAt: new Date()
			}
		]);

		console.log('✅ Bookings created');

		// Create Contracts
		console.log('Creating contracts...');
		// Create Contracts
		console.log('Creating contracts...');
		const [contract1] = await db
			.insert(contracts)
			.values([
				{
					id: crypto.randomUUID(),
					customerId: customer1Id,
					propertyId: property1Id,
					roomId: room1Id,
					bookingId: booking1Id,
					contractType: 'rent',
					startDate: twoMonthsAgo,
					rentAmount: 15000,
					securityDeposit: 15000,
					includeFood: true,
					status: 'active',
					createdAt: twoMonthsAgo,
					updatedAt: new Date()
				}
			])
			.returning();

		const [contract2] = await db
			.insert(contracts)
			.values([
				{
					id: crypto.randomUUID(),
					customerId: customer2Id,
					propertyId: property2Id,
					roomId: room3Id,
					bookingId: booking2Id,
					contractType: 'rent',
					startDate: twoMonthsAgo,
					rentAmount: 8333,
					securityDeposit: 12500,
					includeFood: false,
					status: 'active',
					createdAt: twoMonthsAgo,
					updatedAt: new Date()
				}
			])
			.returning();

		console.log('✅ Contracts created');

		// Create Visits
		console.log('Creating Visits...');
		await db.insert(visitBookings).values([
			{
				customerId: customer1Id,
				propertyId: property1Id,
				visitDate: new Date(now.getTime() + 86400000), // Tomorrow
				visitTime: new Date(now.getTime() + 86400000), // Time part
				status: 'pending'
			},
			{
				customerId: customer2Id,
				propertyId: property1Id,
				visitDate: new Date(now.getTime() - 86400000), // Yesterday
				visitTime: new Date(now.getTime() - 86400000),
				status: 'cancelled',
				cancelReason: 'Changed mind',
				cancelledBy: customerUser2Id
			}
		]);
		console.log('✅ Visits created');

		// Create Settings
		console.log('Creating System Settings...');
		await db.insert(systemSettings).values({
			settingKey: 'allow_manager_delete',
			settingValue: false, // Default
			updatedBy: 'system'
		});
		console.log('✅ Settings created');

		// Create payments
		console.log('Creating payments...');
		const oneMonthAgo = new Date(now);
		oneMonthAgo.setMonth(now.getMonth() - 1);

		await db.insert(payments).values([
			{
				id: crypto.randomUUID(),
				bookingId: booking1Id,
				contractId: contract1.id,
				customerId: customer1Id,
				amount: 15000,
				type: 'security_deposit',
				mode: 'online',
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
				contractId: contract1.id,
				customerId: customer1Id,
				amount: 15000,
				type: 'rent',
				mode: 'upi',
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
				contractId: contract1.id,
				customerId: customer1Id,
				amount: 15000,
				type: 'rent',
				mode: 'upi',
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
				mode: 'upi',
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
				contractId: contract2.id,
				customerId: customer2Id,
				amount: 12500,
				type: 'security_deposit',
				mode: 'cash',
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
				contractId: contract2.id,
				customerId: customer2Id,
				amount: 8333,
				type: 'rent',
				mode: 'upi',
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
		console.log('Creating tickets and messages...');
		const ticket1Id = crypto.randomUUID();
		const ticket2Id = crypto.randomUUID();

		await db.insert(tickets).values([
			{
				id: ticket1Id,
				subject: 'Water Leakage',
				customerId: customer1Id,
				propertyId: property1Id,
				roomId: room1Id,
				type: 'plumbing',
				description: 'Leaking tap in bathroom. The tap has been leaking for 2 days now.',
				status: 'open',
				priority: 'high',
				assignedTo: staffUser2Id, // Janitor
				createdAt: now,
				updatedAt: now
			},
			{
				id: ticket2Id,
				subject: 'Slow WiFi',
				customerId: customer2Id,
				propertyId: property2Id,
				roomId: room3Id,
				type: 'wifi',
				description: 'Internet connection is very slow since yesterday.',
				status: 'in_progress',
				priority: 'medium',
				createdAt: oneMonthAgo,
				updatedAt: now
			}
		]);

		// Create sample messages
		await db.insert(ticketMessages).values([
			{
				id: crypto.randomUUID(),
				ticketId: ticket1Id,
				senderId: customerUser1Id!,
				content: 'When will someone come to fix it?',
				createdAt: new Date(now.getTime() + 1000 * 60 * 30) // 30 mins later
			},
			{
				id: crypto.randomUUID(),
				ticketId: ticket2Id,
				senderId: customerUser2Id!,
				content: 'I have an important meeting tomorrow, please fix ASAP.',
				createdAt: new Date(oneMonthAgo.getTime() + 1000 * 60 * 60) // 1 hour later
			},
			{
				id: crypto.randomUUID(),
				ticketId: ticket2Id,
				senderId: staffUser1Id!, // Someone replied
				content: 'We are looking into it. A technician will visit tomorrow morning.',
				createdAt: new Date(oneMonthAgo.getTime() + 1000 * 60 * 60 * 2) // 2 hours later
			}
		]);

		console.log('✅ Tickets created');

		console.log('\n🎉 Database seeding completed successfully!');
		console.log('\n📝 Test Credentials (ready to use):');
		console.log('   Admin:    admin@pms.local    / password123');
		console.log('   Manager:  manager@pms.local  / password123');
		console.log('   Prop Man: propman@pms.local  / password123');
		console.log('   Chef:     chef@pms.local     / password123');
		console.log('   Janitor:  janitor@pms.local  / password123');
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
