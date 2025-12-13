import { db } from '$lib/server/db';

export const load = async () => {
	try {
		// Fetch statistics
		const [properties, rooms, customers, bookings, payments] = await Promise.all([
			db.query.properties.findMany(),
			db.query.rooms.findMany(),
			db.query.customers.findMany(),
			db.query.bookings.findMany({
				with: {
					property: true,
					room: true,
					customer: true
				}
			}),
			db.query.payments.findMany({
				with: {
					customer: true
				}
			})
		]);

		// Calculate statistics
		const activeCustomers = customers.filter((c) => c.status === 'active').length;
		const activeBookings = bookings.filter((b) => b.status === 'active').length;
		const occupiedRooms = rooms.filter((r) => r.status === 'occupied').length;
		const occupancyRate = rooms.length > 0 ? Math.round((occupiedRooms / rooms.length) * 100) : 0;

		// Calculate this month's revenue
		const now = new Date();
		const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const monthlyRevenue = payments
			.filter(
				(p) =>
					p.paymentDate &&
					new Date(p.paymentDate) >= thisMonth &&
					p.status === 'paid' &&
					p.type === 'rent'
			)
			.reduce((sum, p) => sum + p.amount, 0);

		const pendingPayments = payments.filter((p) => p.status === 'pending').length;

		// Get recent bookings and payments
		const recentBookings = bookings
			.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
			.slice(0, 5);

		const recentPayments = payments
			.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
			.slice(0, 5);

		return {
			stats: {
				totalProperties: properties.length,
				totalRooms: rooms.length,
				totalCustomers: customers.length,
				activeCustomers,
				activeBookings,
				occupancyRate,
				monthlyRevenue,
				pendingPayments
			},
			recentBookings,
			recentPayments
		};
	} catch (error) {
		console.error('Error loading dashboard data:', error);
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
};
