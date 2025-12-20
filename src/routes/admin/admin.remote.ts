import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { bookings, customers, payments, properties, rooms } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { count, eq } from 'drizzle-orm';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	const role = event.locals.user.role;
	// Only admin, manager, and property_manager can access admin functions
	if (role !== 'admin' && role !== 'manager' && role !== 'property_manager') {
		throw error(403, 'Forbidden - Admin/Manager/Property Manager only');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getDashboardStats = query(async () => {
	const { sessionUser } = getSession();

	// Property managers should use getPropertyManagerDashboard instead
	if (sessionUser.role === 'property_manager') {
		throw error(403, 'Property managers should use getPropertyManagerDashboard');
	}

	try {
		const [
			totalProperties,
			totalRooms,
			totalCustomers,
			activeCustomers,
			activeBookings,
			monthlyRevenue,
			pendingPayments
		] = await Promise.all([
			db
				.select({ count: count() })
				.from(properties)
				.then((res) => res[0].count),
			db
				.select({ count: count() })
				.from(rooms)
				.then((res) => res[0].count),
			db
				.select({ count: count() })
				.from(customers)
				.then((res) => res[0].count),
			db
				.select({ count: count() })
				.from(customers)
				.where(eq(customers.status, 'active'))
				.then((res) => res[0].count),
			db
				.select({ count: count() })
				.from(bookings)
				.where(eq(bookings.status, 'confirmed'))
				.then((res) => res[0].count),
			db.query.payments
				.findMany({ columns: { amount: true } })
				.then((payments) => payments.reduce((sum, p) => sum + p.amount, 0)),
			db
				.select({ count: count() })
				.from(payments)
				.where(eq(payments.status, 'pending'))
				.then((res) => res[0].count)
		]);

		const occupancyRate = totalRooms > 0 ? Math.round((activeBookings / totalRooms) * 100) : 0;

		const recentBookings = await db.query.bookings.findMany({
			orderBy: { createdAt: 'desc' },
			limit: 5,
			with: {
				customer: true,
				property: true,
				room: true
			}
		});

		const recentPayments = await db.query.payments.findMany({
			orderBy: { createdAt: 'desc' },
			limit: 5,
			with: {
				customer: true
			}
		});

		return {
			stats: {
				totalProperties,
				totalRooms,
				totalCustomers,
				activeCustomers,
				activeBookings,
				occupancyRate,
				monthlyRevenue,
				pendingPayments
			},
			recentBookings,
			recentPayments
		};
	} catch (e) {
		console.error('Error fetching dashboard stats:', e);
		return {
			stats: {
				totalProperties: 0,
				totalRooms: 0,
				totalCustomers: 0,
				activeCustomers: 0,
				activeBookings: 0,
				occupancyRate: 0,
				monthlyRevenue: 0,
				pendingPayments: 0
			},
			recentBookings: [],
			recentPayments: []
		};
	}
});

export const getPropertyManagerDashboard = query(async () => {
	const { sessionUser } = getSession();

	if (sessionUser.role !== 'property_manager') {
		throw error(403, 'This endpoint is for property managers only');
	}

	try {
		// Get assigned properties
		const assignments = await db.query.propertyManagerAssignments.findMany({
			where: { userId: sessionUser.id },
			columns: { propertyId: true }
		});

		const assignedPropertyIds = assignments.map((a) => a.propertyId);

		if (assignedPropertyIds.length === 0) {
			return {
				stats: {
					assignedProperties: 0,
					totalRooms: 0,
					occupiedRooms: 0,
					activeCustomers: 0,
					occupancyRate: 0,
					monthlyRevenue: 0
				},
				assignedProperties: [],
				recentActivity: []
			};
		}

		// Get property details with room counts
		const assignedProperties = await db.query.properties.findMany({
			where: { id: { in: assignedPropertyIds } },
			with: {
				rooms: {
					with: {
						bookings: {
							where: { status: 'confirmed' }
						}
					}
				}
			}
		});

		const propertiesWithStats = assignedProperties.map((property) => ({
			...property,
			roomCount: property.rooms.length,
			occupiedRooms: property.rooms.filter((room) => room.bookings.length > 0).length
		}));

		const totalRooms = propertiesWithStats.reduce((sum, p) => sum + p.roomCount, 0);
		const occupiedRooms = propertiesWithStats.reduce((sum, p) => sum + p.occupiedRooms, 0);
		const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

		// Get active customers (from bookings and contracts)
		const [bookingCustomers, contractCustomers] = await Promise.all([
			db.query.bookings.findMany({
				where: { propertyId: { in: assignedPropertyIds }, status: 'confirmed' },
				columns: { customerId: true }
			}),
			db.query.contracts.findMany({
				where: { propertyId: { in: assignedPropertyIds } },
				columns: { customerId: true }
			})
		]);

		const uniqueCustomerIds = new Set([
			...bookingCustomers.map((b) => b.customerId),
			...contractCustomers.map((c) => c.customerId)
		]);
		const activeCustomers = uniqueCustomerIds.size;

		// Get monthly revenue (payments linked through bookings)
		const propertyBookings = await db.query.bookings.findMany({
			where: { propertyId: { in: assignedPropertyIds } },
			columns: { id: true }
		});
		const bookingIds = propertyBookings.map((b) => b.id);

		const propertyPayments =
			bookingIds.length > 0
				? await db.query.payments.findMany({
						where: { bookingId: { in: bookingIds } },
						columns: { amount: true }
					})
				: [];
		const monthlyRevenue = propertyPayments.reduce((sum, p) => sum + p.amount, 0);

		// Get recent activity (bookings and payments)
		const recentBookings = await db.query.bookings.findMany({
			where: { propertyId: { in: assignedPropertyIds } },
			orderBy: { createdAt: 'desc' },
			limit: 5,
			with: {
				customer: true,
				property: true,
				room: true
			}
		});

		const recentPayments =
			bookingIds.length > 0
				? await db.query.payments.findMany({
						where: { bookingId: { in: bookingIds } },
						orderBy: { createdAt: 'desc' },
						limit: 5,
						with: {
							customer: true
						}
					})
				: [];

		const recentActivity = [
			...recentBookings.map((b) => ({ ...b, type: 'booking' })),
			...recentPayments.map((p) => ({ ...p, type: 'payment' }))
		]
			.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
			.slice(0, 10);

		return {
			stats: {
				assignedProperties: assignedProperties.length,
				totalRooms,
				occupiedRooms,
				activeCustomers,
				occupancyRate,
				monthlyRevenue
			},
			assignedProperties: propertiesWithStats,
			recentActivity
		};
	} catch (e) {
		console.error('Error fetching property manager dashboard:', e);
		return {
			stats: {
				assignedProperties: 0,
				totalRooms: 0,
				occupiedRooms: 0,
				activeCustomers: 0,
				occupancyRate: 0,
				monthlyRevenue: 0
			},
			assignedProperties: [],
			recentActivity: []
		};
	}
});
