import { command, getRequestEvent, query } from '$app/server';
import { ticketMessageSchema } from '$lib/schemas/ticket';
import { db } from '$lib/server/db';
import { ticketMessages, tickets } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	const sessionUser = event?.locals.user;
	if (!sessionUser || sessionUser.role !== 'staff') {
		throw error(403, 'Forbidden - Staff only');
	}
	return { sessionUser } as { sessionUser: NonNullable<typeof event.locals.user> };
};

// Types for Drizzle RQB filters
type TicketFilter = Record<string, unknown> | { OR: TicketFilter[] } | { AND: TicketFilter[] };

export const getStaffTickets = query(
	z.object({
		searchTerm: z.string().optional(),
		status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
		priority: z.enum(['low', 'medium', 'high']).optional(),
		assignmentFilter: z.enum(['assigned', 'unassigned', 'all']).default('all'),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, status, priority, assignmentFilter, page, pageSize }) => {
		const { sessionUser } = getSession();

		const filters: TicketFilter[] = [];

		// Search filter
		if (searchTerm) {
			filters.push({
				OR: [{ subject: { like: `%${searchTerm}%` } }, { description: { like: `%${searchTerm}%` } }]
			});
		}

		// Status filter
		if (status) filters.push({ status });

		// Priority filter
		if (priority) filters.push({ priority });

		// Assignment filter - staff can see assigned to them or unassigned tickets
		if (assignmentFilter === 'assigned') {
			filters.push({ assignedTo: sessionUser.id });
		} else if (assignmentFilter === 'unassigned') {
			filters.push({ assignedTo: { isNull: true } });
		} else {
			// Show both assigned to this staff and unassigned tickets
			filters.push({
				OR: [{ assignedTo: sessionUser.id }, { assignedTo: { isNull: true } }]
			});
		}

		const whereClause: TicketFilter = filters.length > 0 ? { AND: filters } : {};

		const allMatching = await db.query.tickets.findMany({
			where: whereClause,
			columns: { id: true }
		});
		const total = allMatching.length;

		const result = await db.query.tickets.findMany({
			where: whereClause,
			limit: pageSize,
			offset: (page - 1) * pageSize,
			orderBy: (table, { desc }) => [desc(table.createdAt)],
			with: {
				customer: true,
				property: true,
				room: true,
				assignedStaff: true
			}
		});

		return {
			tickets: result,
			total,
			page,
			pageSize,
			totalPages: Math.ceil(total / pageSize)
		};
	}
);

export const getStaffTicket = query(z.string(), async (id) => {
	const { sessionUser } = getSession();

	const ticket = await db.query.tickets.findFirst({
		where: { id },
		with: {
			customer: true,
			property: true,
			room: true,
			assignedStaff: true,
			messages: {
				with: {
					sender: true
				},
				orderBy: (table, { asc }) => [asc(table.createdAt)]
			}
		}
	});

	if (!ticket) throw error(404, 'Ticket not found');

	// Staff can only view tickets assigned to them or unassigned tickets
	if (ticket.assignedTo && ticket.assignedTo !== sessionUser.id) {
		throw error(403, 'You can only view tickets assigned to you or unassigned tickets');
	}

	return ticket;
});

export const sendStaffTicketMessage = command(ticketMessageSchema, async (data) => {
	const { sessionUser } = getSession();

	const ticket = await db.query.tickets.findFirst({
		where: { id: data.ticketId }
	});

	if (!ticket) throw error(404, 'Ticket not found');

	// Staff can only message tickets assigned to them
	if (ticket.assignedTo !== sessionUser.id) {
		throw error(403, 'You can only message tickets assigned to you');
	}

	await db.insert(ticketMessages).values({
		id: crypto.randomUUID(),
		ticketId: data.ticketId,
		senderId: sessionUser.id,
		content: data.content
	});

	return { success: true };
});

export const updateStaffTicketStatus = command(
	z.object({
		id: z.string(),
		status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
		priority: z.enum(['low', 'medium', 'high']).optional(),
		assignToSelf: z.boolean().optional()
	}),
	async (data) => {
		const { sessionUser } = getSession();

		const ticket = await db.query.tickets.findFirst({
			where: { id: data.id }
		});

		if (!ticket) throw error(404, 'Ticket not found');

		// Staff can assign unassigned tickets to themselves
		// or update tickets already assigned to them
		if (ticket.assignedTo && ticket.assignedTo !== sessionUser.id) {
			throw error(403, 'You can only update tickets assigned to you');
		}

		const updateData: {
			status: 'open' | 'in_progress' | 'resolved' | 'closed';
			updatedAt: Date;
			priority?: 'low' | 'medium' | 'high';
			assignedTo?: string;
		} = {
			status: data.status,
			updatedAt: new Date()
		};

		if (data.priority) {
			updateData.priority = data.priority;
		}

		if (data.assignToSelf && !ticket.assignedTo) {
			updateData.assignedTo = sessionUser.id;
		}

		await db.update(tickets).set(updateData).where(eq(tickets.id, data.id));

		return { success: true };
	}
);
