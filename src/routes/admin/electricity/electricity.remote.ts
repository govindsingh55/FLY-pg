import { form, getRequestEvent, query } from '$app/server';
import { db } from '$lib/server/db';
import { electricityReadings, notifications, payments } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { z } from 'zod';

const getSession = () => {
	const event = getRequestEvent();
	if (!event || !event.locals.session || !event.locals.user) {
		throw error(401, 'Unauthorized');
	}
	return { session: event.locals.session, sessionUser: event.locals.user };
};

const recordReadingSchema = z.object({
	contractId: z.string().min(1, 'Contract is required'),
	month: z.number().min(1).max(12),
	year: z.number().min(2020),
	unitsConsumed: z.number().min(0, 'Units must be positive'),
	note: z.string().optional()
});

export const recordReading = form(
	recordReadingSchema,
	async ({ contractId, month, year, unitsConsumed, note }) => {
		const { sessionUser } = getSession();

		if (
			sessionUser.role !== 'admin' &&
			sessionUser.role !== 'manager' &&
			sessionUser.role !== 'property_manager'
		) {
			throw error(403, 'Forbidden');
		}

		// 1. Fetch Contract & Property Details
		const contract = await db.query.contracts.findFirst({
			where: { id: contractId },
			with: {
				property: true,
				customer: true,
				room: true
			}
		});

		if (!contract || !contract.property) {
			throw error(404, 'Contract or Property not found');
		}

		// 2. check unique constraint
		const existing = await db.query.electricityReadings.findFirst({
			where: {
				contractId,
				month,
				year
			}
		});

		if (existing) {
			throw error(400, 'Reading already exists for this month');
		}

		// 3. Calculate Cost
		const unitCost = contract.property.electricityUnitCost || 0;
		const totalAmount = unitsConsumed * unitCost;

		try {
			// Transaction to ensure atomicity
			await db.transaction(async (tx) => {
				// 4. Create Payment (Pending)
				const paymentId = crypto.randomUUID();
				await tx.insert(payments).values({
					id: paymentId,
					customerId: contract.customerId,
					bookingId: contract.bookingId,
					contractId: contract.id,
					amount: totalAmount,
					type: 'electricity',
					status: 'pending',
					mode: 'online', // Default
					createdAt: new Date(),
					updatedAt: new Date()
				});

				// 5. Create Reading
				await tx.insert(electricityReadings).values({
					contractId,
					propertyId: contract.propertyId,
					roomId: contract.roomId,
					customerId: contract.customerId,
					month,
					year,
					unitsConsumed,
					unitCost,
					totalAmount,
					note: note || null,
					paymentId,
					readingDate: new Date(),
					createdBy: sessionUser.id
				});

				// 6. Send Notification
				await tx.insert(notifications).values({
					userId: contract.customerId,
					senderId: sessionUser.id,
					title: 'Electricity Bill Generated',
					message: `Your electricity bill for ${month}/${year} has been generated. Amount: $${totalAmount} (${unitsConsumed} units @ $${unitCost}/unit).`,
					type: 'electricity',
					isRead: false
				});
			});

			return { success: true };
		} catch (e) {
			console.error(e);
			throw error(500, 'Failed to record reading');
		}
	}
);

export const getReadings = query(
	z.object({
		contractId: z.string().optional(),
		month: z.number().optional(),
		year: z.number().optional(),
		limit: z.number().default(20),
		offset: z.number().default(0)
	}),
	async ({ contractId, month, year, limit, offset }) => {
		const where: { contractId?: string; month?: number; year?: number } = {};
		if (contractId) where.contractId = contractId;
		if (month) where.month = month;
		if (year) where.year = year;

		// Role based filtering could be added here if needed, but assuming admin access for now based on file path

		const result = await db.query.electricityReadings.findMany({
			where,
			with: {
				customer: true,
				room: true,
				payment: true
			},
			orderBy: { createdAt: 'desc' },
			limit,
			offset
		});

		return { readings: result };
	}
);
