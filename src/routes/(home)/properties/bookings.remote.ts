import { form, getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { visitBookings, bookings, customers } from '$lib/server/db/schema';
import { requestVisitSchema } from '$lib/schemas/visit';
import { publicBookingSchema } from '$lib/schemas/booking';
import { error } from '@sveltejs/kit';

// Get or create customer from session
async function getOrCreateCustomer() {
	const event = getRequestEvent();
	if (!event || !event.locals.user) {
		throw error(401, 'Please login to continue');
	}

	const userId = event.locals.user.id;

	// Check if customer profile exists
	let customer = await db.query.customers.findFirst({
		where: { userId }
	});

	// If not, create a basic customer profile
	if (!customer) {
		const customerId = crypto.randomUUID();
		await db.insert(customers).values({
			id: customerId,
			userId,
			name: event.locals.user.name,
			email: event.locals.user.email,
			phone: '' // Will be updated later
		});

		customer = await db.query.customers.findFirst({
			where: { id: customerId }
		});

		if (!customer) {
			throw error(500, 'Failed to create customer profile');
		}
	}

	return customer;
}

export const requestVisit = form(requestVisitSchema, async (data) => {
	const customer = await getOrCreateCustomer();

	// Combine date and time into a single timestamp
	const visitDateTime = new Date(`${data.visitDate}T${data.visitTime}`);

	try {
		const visitId = crypto.randomUUID();
		await db.insert(visitBookings).values({
			id: visitId,
			customerId: customer.id,
			propertyId: data.propertyId,
			visitDate: new Date(data.visitDate),
			visitTime: visitDateTime,
			status: 'pending'
		});

		return { success: true, message: 'Visit request submitted successfully!' };
	} catch (e) {
		console.error('Error creating visit booking:', e);
		throw error(500, 'Failed to submit visit request');
	}
});

export const createBooking = form(publicBookingSchema, async (data) => {
	const customer = await getOrCreateCustomer();

	// Fetch room details to get property info and booking charge
	const room = await db.query.rooms.findFirst({
		where: { id: data.roomId },
		with: {
			property: true
		}
	});

	if (!room) {
		throw error(404, 'Room not found');
	}

	const bookingCharge = room.property?.bookingCharge || 0;

	try {
		const bookingId = crypto.randomUUID();
		await db.insert(bookings).values({
			id: bookingId,
			customerId: customer.id,
			propertyId: data.propertyId,
			roomId: data.roomId,
			bookingCharge,
			status: 'pending',
			paymentStatus: 'pending'
		});

		return {
			success: true,
			message: 'Booking request submitted successfully!',
			bookingId
		};
	} catch (e) {
		console.error('Error creating booking:', e);
		throw error(500, 'Failed to submit booking request');
	}
});
