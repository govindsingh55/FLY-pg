import { command, form, getRequestEvent, query } from '$app/server';
import { ticketMessageSchema, ticketSchema } from '$lib/schemas/ticket';
import { db } from '$lib/server/db';
import { ticketMessages, tickets } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	const sessionUser = event?.locals.user;
	if (!sessionUser) {
		throw error(401, 'Unauthorized');
	}
	return { sessionUser } as { sessionUser: NonNullable<typeof event.locals.user> };
};

// Types for Drizzle RQB filters
type TicketFilter = Record<string, unknown> | { OR: TicketFilter[] } | { AND: TicketFilter[] };

export const getTickets = query(
	z.object({
		searchTerm: z.string().optional(),
		status: z.enum(['open', 'in_progress', 'resolved', 'closed']).optional(),
		priority: z.enum(['low', 'medium', 'high']).optional(),
		page: z.number().default(1),
		pageSize: z.number().default(10)
	}),
	async ({ searchTerm, status, priority, page, pageSize }) => {
		const { sessionUser } = getSession();

		const filters: TicketFilter[] = [];
		if (searchTerm) {
			filters.push({
				OR: [{ subject: { like: `%${searchTerm}%` } }, { description: { like: `%${searchTerm}%` } }]
			});
		}
		if (status) filters.push({ status });
		if (priority) filters.push({ priority });

		// Role-based filtering
		if (sessionUser.role === 'customer') {
			const customer = await db.query.customers.findFirst({
				where: { userId: sessionUser.id }
			});
			if (customer) {
				filters.push({ customerId: customer.id });
			} else {
				return { tickets: [], total: 0, page, pageSize, totalPages: 0 };
			}
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

export const getTicket = query(z.string(), async (id) => {
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

	// Access control
	if (sessionUser.role === 'customer') {
		const customer = await db.query.customers.findFirst({
			where: { userId: sessionUser.id }
		});
		if (!customer || ticket.customerId !== customer.id) {
			throw error(403, 'Forbidden');
		}
	}

	return ticket;
});

export const sendTicketMessage = command(ticketMessageSchema, async (data) => {
	const { sessionUser } = getSession();

	const ticket = await db.query.tickets.findFirst({
		where: { id: data.ticketId }
	});

	if (!ticket) throw error(404, 'Ticket not found');

	// Basic access control
	if (sessionUser.role === 'customer') {
		const customer = await db.query.customers.findFirst({
			where: { userId: sessionUser.id }
		});
		if (!customer || ticket.customerId !== customer.id) {
			throw error(403, 'Forbidden');
		}
	}

	await db.insert(ticketMessages).values({
		id: crypto.randomUUID(),
		ticketId: data.ticketId,
		senderId: sessionUser.id,
		content: data.content
	});

	return { success: true };
});

export const updateTicketStatus = command(
	z.object({
		id: z.string(),
		status: z.enum(['open', 'in_progress', 'resolved', 'closed']),
		priority: z.enum(['low', 'medium', 'high']).optional(),
		assignedTo: z.string().optional()
	}),
	async (data) => {
		const { sessionUser } = getSession();

		const ticket = await db.query.tickets.findFirst({
			where: { id: data.id }
		});

		if (!ticket) throw error(404, 'Ticket not found');

		// Role-based logic
		if (sessionUser.role === 'customer') {
			if (data.status !== 'closed') {
				throw error(403, 'Customers can only close tickets');
			}
			const customer = await db.query.customers.findFirst({
				where: { userId: sessionUser.id }
			});
			if (!customer || ticket.customerId !== customer.id) {
				throw error(403, 'Forbidden');
			}
		}

		await db
			.update(tickets)
			.set({
				status: data.status,
				priority: data.priority ?? ticket.priority,
				assignedTo: data.assignedTo ?? ticket.assignedTo,
				updatedAt: new Date()
			})
			.where(eq(tickets.id, data.id));

		return { success: true };
	}
);

export const createTicket = form(ticketSchema, async (data) => {
	const { sessionUser } = getSession();

	let customerId = data.customerId;
	let propertyId = data.propertyId;
	let roomId = data.roomId;

	if (sessionUser.role === 'customer') {
		const customer = await db.query.customers.findFirst({
			where: { userId: sessionUser.id }
		});
		if (!customer) throw error(400, 'Customer profile not found');
		customerId = customer.id;

		// Automatically find property and room from active booking
		const booking = await db.query.bookings.findFirst({
			where: { customerId: customer.id, status: 'confirmed' }
		});
		if (booking) {
			propertyId = booking.propertyId;
			roomId = booking.roomId;
		}
	}

	try {
		await db.insert(tickets).values({
			id: crypto.randomUUID(),
			customerId: customerId,
			propertyId: propertyId ?? null,
			roomId: roomId ?? null,
			subject: data.subject,
			description: data.description,
			type: data.type,
			priority: data.priority ?? 'medium',
			status: 'open'
		});
		return { success: true };
	} catch (e) {
		console.error(e);
		throw error(500, 'Failed to create ticket');
	}
});
