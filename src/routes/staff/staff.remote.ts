import { getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { tickets } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { and, count, eq, isNull } from 'drizzle-orm';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	if (event.locals.user.role !== 'staff') {
		throw error(403, 'Forbidden - Staff only');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

export const getStaffDashboard = query(async () => {
	const { sessionUser } = getSession();

	try {
		const userId = sessionUser.id;

		const [assignedTicketsData, openTicketsCount, totalResolvedCount] = await Promise.all([
			// Tickets assigned to this staff member (not closed)
			db.query.tickets.findMany({
				where: {
					assignedTo: userId,
					status: { ne: 'closed' }
				},
				with: {
					customer: true,
					property: true,
					room: true
				},
				orderBy: { createdAt: 'desc' },
				limit: 10
			}),

			// Open/unassigned tickets count
			db
				.select({ count: count() })
				.from(tickets)
				.where(and(eq(tickets.status, 'open'), isNull(tickets.assignedTo)))
				.then((res) => res[0].count),

			// Total resolved tickets by this staff member
			db
				.select({ count: count() })
				.from(tickets)
				.where(and(eq(tickets.assignedTo, userId), eq(tickets.status, 'resolved')))
				.then((res) => res[0].count)
		]);

		return {
			stats: {
				assignedToMe: assignedTicketsData.length,
				openTickets: openTicketsCount,
				resolvedToday: 0, // TODO: Implement proper date filtering when needed
				totalResolved: totalResolvedCount
			},
			assignedTickets: assignedTicketsData
		};
	} catch (e) {
		console.error('Error fetching staff dashboard:', e);
		return {
			stats: {
				assignedToMe: 0,
				openTickets: 0,
				resolvedToday: 0,
				totalResolved: 0
			},
			assignedTickets: []
		};
	}
});
