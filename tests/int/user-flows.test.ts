import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload, Payload } from 'payload'
import config from '@/payload/payload.config'

let payload: Payload

describe('User Flows Integration Tests', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    if (payload) {
      await payload.destroy()
    }
  })

  describe('Customer Registration and Authentication Flow', () => {
    it('should allow customer to register and authenticate', async () => {
      // Test customer registration
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'testpassword123',
        address: {
          country: 'India',
        },
      }

      const customer = await payload.create({
        collection: 'customers',
        data: customerData,
      })

      expect(customer).toBeDefined()
      expect(customer.email).toBe(customerData.email)
      expect(customer.name).toBe(customerData.name)

      // Test customer authentication
      const authResult = await payload.login({
        collection: 'customers',
        data: {
          email: customerData.email,
          password: customerData.password,
        },
      })

      expect(authResult).toBeDefined()
      expect(authResult.user.id).toBe(customer.id)
    })
  })

  describe('Property Booking Flow', () => {
    it('should allow customer to book a property', async () => {
      // Create a test property
      const property = await payload.create({
        collection: 'properties',
        data: {
          name: 'Test Property',
          description: 'A test property for booking',
          location: 'Test Location',
          price: 5000,
          status: 'available',
        },
      })

      expect(property).toBeDefined()

      // Create a test customer
      const customer = await payload.create({
        collection: 'customers',
        data: {
          name: 'Booking Customer',
          email: 'booking@example.com',
          phone: '9876543210',
          password: 'password123',
          address: { country: 'India' },
        },
      })

      // Create a booking
      const booking = await payload.create({
        collection: 'bookings',
        data: {
          customer: customer.id,
          property: property.id,
          checkIn: '2024-02-01',
          checkOut: '2024-02-28',
          status: 'confirmed',
          totalAmount: 140000,
        },
      })

      expect(booking).toBeDefined()
      expect(booking.customer).toBe(customer.id)
      expect(booking.property).toBe(property.id)
      expect(booking.status).toBe('confirmed')
    })
  })

  describe('Payment Processing Flow', () => {
    it('should handle payment creation and status updates', async () => {
      // Create test customer
      const customer = await payload.create({
        collection: 'customers',
        data: {
          name: 'Payment Customer',
          email: 'payment@example.com',
          phone: '5555555555',
          password: 'password123',
          address: { country: 'India' },
        },
      })

      // Create test booking
      const booking = await payload.create({
        collection: 'bookings',
        data: {
          customer: customer.id,
          property: 'test-property-id',
          checkIn: '2024-03-01',
          checkOut: '2024-03-31',
          status: 'confirmed',
          totalAmount: 150000,
        },
      })

      // Create payment
      const payment = await payload.create({
        collection: 'payments',
        data: {
          customer: customer.id,
          booking: booking.id,
          amount: 150000,
          status: 'pending',
          paymentMethod: 'phonepe',
          dueDate: '2024-02-25',
        },
      })

      expect(payment).toBeDefined()
      expect(payment.status).toBe('pending')

      // Update payment status
      const updatedPayment = await payload.update({
        collection: 'payments',
        id: payment.id,
        data: {
          status: 'completed',
          paymentDate: new Date().toISOString(),
        },
      })

      expect(updatedPayment.status).toBe('completed')
    })
  })

  describe('Support Ticket Flow', () => {
    it('should allow customer to create and manage support tickets', async () => {
      // Create test customer
      const customer = await payload.create({
        collection: 'customers',
        data: {
          name: 'Support Customer',
          email: 'support@example.com',
          phone: '1111111111',
          password: 'password123',
          address: { country: 'India' },
        },
      })

      // Create support ticket
      const ticket = await payload.create({
        collection: 'support-tickets',
        data: {
          customer: customer.id,
          subject: 'Test Support Request',
          description: 'This is a test support ticket',
          priority: 'medium',
          status: 'open',
          category: 'general',
        },
      })

      expect(ticket).toBeDefined()
      expect(ticket.status).toBe('open')
      expect(ticket.customer).toBe(customer.id)

      // Update ticket status
      const updatedTicket = await payload.update({
        collection: 'support-tickets',
        id: ticket.id,
        data: {
          status: 'in-progress',
        },
      })

      expect(updatedTicket.status).toBe('in-progress')
    })
  })
})
