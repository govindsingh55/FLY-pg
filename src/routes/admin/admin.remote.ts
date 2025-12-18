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
	if (role !== 'admin' && role !== 'manager' && role !== 'staff') {
		throw error(403, 'Forbidden');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getDashboardStats = query(async () => {
	getSession(); // Ensure auth

	try {
		const [
			propertiesCount,
			roomsCount,
			customersCount,
			activeCustomersCount,
			occupiedRoomsCount,
			activeBookingsCount,
			pendingPaymentsCount,
			recentBookingsData,
			recentPaymentsData,
			allPayments
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
				.from(rooms)
				.where(eq(rooms.status, 'occupied'))
				.then((res) => res[0].count),
			db
				.select({ count: count() })
				.from(bookings)
				.where(eq(bookings.status, 'active'))
				.then((res) => res[0].count),
			db
				.select({ count: count() })
				.from(payments)
				.where(eq(payments.status, 'pending'))
				.then((res) => res[0].count),

			db.query.bookings.findMany({
				limit: 5,
				orderBy: {
					createdAt: 'desc'
				},
				with: { property: true, room: true, customer: true }
			}),

			db.query.payments.findMany({
				limit: 5,
				orderBy: {
					createdAt: 'desc'
				},
				with: { customer: true }
			}),

			// Fetch relevant payments for revenue calc (paid & rent)
			db.query.payments.findMany({
				where: {
					status: 'paid',
					type: 'rent'
				},
				orderBy: {
					createdAt: 'desc'
				}
			})
		]);

		// Calculate Revenue in JS
		const now = new Date();
		const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const monthlyRevenue = allPayments
			.filter((p) => p.paymentDate && new Date(p.paymentDate) >= thisMonth)
			.reduce((sum, p) => sum + p.amount, 0);

		const occupancyRate = roomsCount > 0 ? Math.round((occupiedRoomsCount / roomsCount) * 100) : 0;

		return {
			stats: {
				totalProperties: propertiesCount,
				totalRooms: roomsCount,
				totalCustomers: customersCount,
				activeCustomers: activeCustomersCount,
				activeBookings: activeBookingsCount,
				occupancyRate,
				monthlyRevenue,
				pendingPayments: pendingPaymentsCount
			},
			recentBookings: recentBookingsData,
			recentPayments: recentPaymentsData
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
