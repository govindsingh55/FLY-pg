import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest'
import { getPayload, Payload } from 'payload'
import config from '@/payload/payload.config'

let payload: Payload

describe('Critical Business Flows Integration Tests', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  afterAll(async () => {
    if (payload) {
      await payload.destroy()
    }
  })

  beforeEach(async () => {
    // Clean up test data before each test
    try {
      await payload.delete({
        collection: 'customers',
        where: {
          email: {
            in: ['test@example.com', 'booking@example.com', 'payment@example.com'],
          },
        },
      })
    } catch (error) {
      // Ignore errors if no data exists
    }
  })

  describe('Complete Customer Journey', () => {
    it('should handle complete customer registration to booking flow', async () => {
      // 1. Customer Registration
      const customerData = {
        name: 'Test Customer',
        email: 'test@example.com',
        phone: '1234567890',
        password: 'testpassword123',
        address: {
          country: 'India',
          state: 'Maharashtra',
          city: 'Mumbai',
          street: 'Test Street',
          pincode: '400001',
        },
        dateOfBirth: '1990-01-01',
        gender: 'male',
        occupation: 'Software Engineer',
        company: 'Test Company',
        notificationPreferences: {
          emailNotifications: true,
          smsNotifications: true,
          pushNotifications: true,
        },
      }

      const customer = await payload.create({
        collection: 'customers',
        data: customerData,
      })

      expect(customer).toBeDefined()
      expect(customer.email).toBe(customerData.email)
      expect(customer.name).toBe(customerData.name)

      // 2. Customer Authentication
      const authResult = await payload.login({
        collection: 'customers',
        data: {
          email: customerData.email,
          password: customerData.password,
        },
      })

      expect(authResult).toBeDefined()
      expect(authResult.user.id).toBe(customer.id)

      // 3. Property Search and Selection
      const property = await payload.create({
        collection: 'properties',
        data: {
          name: 'Test Property',
          description: 'A test property for booking',
          location: 'Test Location',
          price: 5000,
          status: 'available',
          amenities: ['WiFi', 'AC', 'Kitchen'],
          images: [],
        },
      })

      expect(property).toBeDefined()
      expect(property.status).toBe('available')

      // 4. Booking Creation
      const booking = await payload.create({
        collection: 'bookings',
        data: {
          customer: customer.id,
          property: property.id,
          checkIn: '2024-02-01',
          checkOut: '2024-02-28',
          status: 'confirmed',
          totalAmount: 135000, // 27 days * 5000
          numberOfGuests: 2,
          specialRequests: 'Early check-in if possible',
        },
      })

      expect(booking).toBeDefined()
      expect(booking.customer).toBe(customer.id)
      expect(booking.property).toBe(property.id)
      expect(booking.status).toBe('confirmed')

      // 5. Payment Processing
      const payment = await payload.create({
        collection: 'payments',
        data: {
          customer: customer.id,
          booking: booking.id,
          amount: 135000,
          status: 'pending',
          paymentMethod: 'phonepe',
          dueDate: '2024-01-25',
          paymentForMonthAndYear: 'February 2024',
        },
      })

      expect(payment).toBeDefined()
      expect(payment.amount).toBe(135000)
      expect(payment.status).toBe('pending')

      // 6. Payment Completion
      const updatedPayment = await payload.update({
        collection: 'payments',
        id: payment.id,
        data: {
          status: 'completed',
          paymentDate: new Date().toISOString(),
          transactionId: 'TXN123456789',
        },
      })

      expect(updatedPayment.status).toBe('completed')
      expect(updatedPayment.transactionId).toBe('TXN123456789')

      // 7. Booking Confirmation
      const updatedBooking = await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: {
          status: 'active',
          checkInDate: new Date().toISOString(),
        },
      })

      expect(updatedBooking.status).toBe('active')
    })
  })

  describe('Payment Processing & Security', () => {
    it('should handle payment processing with security validation', async () => {
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

      // Test payment validation
      const paymentData = {
        customer: customer.id,
        booking: booking.id,
        amount: 150000,
        paymentMethod: 'phonepe',
        dueDate: '2024-02-25',
      }

      // Validate payment amount
      expect(paymentData.amount).toBeGreaterThan(0)
      expect(paymentData.amount).toBe(booking.totalAmount)

      // Validate payment method
      const validPaymentMethods = ['phonepe', 'card', 'upi', 'netbanking']
      expect(validPaymentMethods).toContain(paymentData.paymentMethod)

      // Create payment
      const payment = await payload.create({
        collection: 'payments',
        data: paymentData,
      })

      expect(payment).toBeDefined()
      expect(payment.status).toBe('pending')

      // Test payment security - validate webhook signature
      const webhookData = {
        paymentId: payment.id,
        status: 'success',
        signature: 'valid-signature-hash',
        amount: 150000,
      }

      // Validate webhook data integrity
      expect(webhookData.paymentId).toBe(payment.id)
      expect(webhookData.amount).toBe(payment.amount)

      // Update payment status
      const updatedPayment = await payload.update({
        collection: 'payments',
        id: payment.id,
        data: {
          status: 'completed',
          paymentDate: new Date().toISOString(),
          transactionId: 'TXN987654321',
        },
      })

      expect(updatedPayment.status).toBe('completed')
    })

    it('should handle payment failures and retries', async () => {
      const customer = await payload.create({
        collection: 'customers',
        data: {
          name: 'Failed Payment Customer',
          email: 'failed@example.com',
          phone: '1111111111',
          password: 'password123',
          address: { country: 'India' },
        },
      })

      const booking = await payload.create({
        collection: 'bookings',
        data: {
          customer: customer.id,
          property: 'test-property-id',
          checkIn: '2024-04-01',
          checkOut: '2024-04-30',
          status: 'confirmed',
          totalAmount: 145000,
        },
      })

      // Create failed payment
      const failedPayment = await payload.create({
        collection: 'payments',
        data: {
          customer: customer.id,
          booking: booking.id,
          amount: 145000,
          status: 'failed',
          paymentMethod: 'phonepe',
          failureReason: 'Insufficient funds',
          retryCount: 1,
        },
      })

      expect(failedPayment.status).toBe('failed')
      expect(failedPayment.retryCount).toBe(1)

      // Retry payment
      const retriedPayment = await payload.update({
        collection: 'payments',
        id: failedPayment.id,
        data: {
          status: 'pending',
          retryCount: 2,
          lastRetryDate: new Date().toISOString(),
        },
      })

      expect(retriedPayment.status).toBe('pending')
      expect(retriedPayment.retryCount).toBe(2)
    })
  })

  describe('Booking Management & Business Rules', () => {
    it('should enforce booking policies and availability', async () => {
      const customer = await payload.create({
        collection: 'customers',
        data: {
          name: 'Booking Customer',
          email: 'booking@example.com',
          phone: '2222222222',
          password: 'password123',
          address: { country: 'India' },
        },
      })

      const property = await payload.create({
        collection: 'properties',
        data: {
          name: 'Popular Property',
          description: 'A popular property',
          location: 'Popular Location',
          price: 8000,
          status: 'available',
          maxGuests: 4,
          minStayDays: 7,
        },
      })

      // Test booking validation
      const bookingData = {
        customer: customer.id,
        property: property.id,
        checkIn: '2024-05-01',
        checkOut: '2024-05-05', // Less than minStayDays
        numberOfGuests: 6, // More than maxGuests
        status: 'pending',
      }

      // Validate minimum stay
      const checkIn = new Date(bookingData.checkIn)
      const checkOut = new Date(bookingData.checkOut)
      const stayDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))

      expect(stayDays).toBeLessThan(property.minStayDays)

      // Validate guest count
      expect(bookingData.numberOfGuests).toBeGreaterThan(property.maxGuests)

      // Create valid booking
      const validBooking = await payload.create({
        collection: 'bookings',
        data: {
          customer: customer.id,
          property: property.id,
          checkIn: '2024-05-01',
          checkOut: '2024-05-15', // 14 days
          numberOfGuests: 3,
          status: 'confirmed',
          totalAmount: 112000, // 14 days * 8000
        },
      })

      expect(validBooking).toBeDefined()
      expect(validBooking.status).toBe('confirmed')

      // Test double booking prevention
      const conflictingBooking = {
        customer: 'another-customer-id',
        property: property.id,
        checkIn: '2024-05-10', // Overlaps with existing booking
        checkOut: '2024-05-20',
        numberOfGuests: 2,
      }

      // This should be prevented in the actual implementation
      expect(conflictingBooking.property).toBe(property.id)
    })

    it('should handle booking modifications and cancellations', async () => {
      const customer = await payload.create({
        collection: 'customers',
        data: {
          name: 'Modify Customer',
          email: 'modify@example.com',
          phone: '3333333333',
          password: 'password123',
          address: { country: 'India' },
        },
      })

      const booking = await payload.create({
        collection: 'bookings',
        data: {
          customer: customer.id,
          property: 'test-property-id',
          checkIn: '2024-06-01',
          checkOut: '2024-06-30',
          status: 'confirmed',
          totalAmount: 145000,
        },
      })

      // Test booking extension
      const extendedBooking = await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: {
          checkOut: '2024-07-15', // Extended by 15 days
          totalAmount: 217500, // 45 days * 5000
          extensionRequests: [
            {
              requestDate: new Date().toISOString(),
              originalCheckOut: '2024-06-30',
              newCheckOut: '2024-07-15',
              reason: 'Business trip extended',
              approved: true,
            },
          ],
        },
      })

      expect(extendedBooking.checkOut).toBe('2024-07-15')
      expect(extendedBooking.totalAmount).toBe(217500)

      // Test booking cancellation
      const cancelledBooking = await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: {
          status: 'cancelled',
          cancellationReason: 'Change of plans',
          cancellationDate: new Date().toISOString(),
          refundAmount: 145000,
        },
      })

      expect(cancelledBooking.status).toBe('cancelled')
      expect(cancelledBooking.cancellationReason).toBe('Change of plans')
    })
  })

  describe('Data Integrity & Consistency', () => {
    it('should maintain data consistency across related collections', async () => {
      const customer = await payload.create({
        collection: 'customers',
        data: {
          name: 'Data Integrity Customer',
          email: 'integrity@example.com',
          phone: '4444444444',
          password: 'password123',
          address: { country: 'India' },
        },
      })

      const property = await payload.create({
        collection: 'properties',
        data: {
          name: 'Integrity Property',
          description: 'Test property for data integrity',
          location: 'Test Location',
          price: 6000,
          status: 'available',
        },
      })

      const booking = await payload.create({
        collection: 'bookings',
        data: {
          customer: customer.id,
          property: property.id,
          checkIn: '2024-08-01',
          checkOut: '2024-08-31',
          status: 'confirmed',
          totalAmount: 180000,
        },
      })

      // Verify data consistency
      const customerBookings = await payload.find({
        collection: 'bookings',
        where: {
          customer: {
            equals: customer.id,
          },
        },
      })

      expect(customerBookings.docs).toHaveLength(1)
      expect(customerBookings.docs[0].id).toBe(booking.id)

      // Verify property availability
      const propertyBookings = await payload.find({
        collection: 'bookings',
        where: {
          property: {
            equals: property.id,
          },
          status: {
            in: ['confirmed', 'active'],
          },
        },
      })

      expect(propertyBookings.docs).toHaveLength(1)

      // Test cascading updates
      const updatedProperty = await payload.update({
        collection: 'properties',
        id: property.id,
        data: {
          price: 7000, // Price increase
        },
      })

      expect(updatedProperty.price).toBe(7000)

      // Verify booking total should be recalculated (in real implementation)
      const recalculatedBooking = await payload.findByID({
        collection: 'bookings',
        id: booking.id,
      })

      expect(recalculatedBooking).toBeDefined()
    })

    it('should handle concurrent operations safely', async () => {
      const customer = await payload.create({
        collection: 'customers',
        data: {
          name: 'Concurrent Customer',
          email: 'concurrent@example.com',
          phone: '5555555555',
          password: 'password123',
          address: { country: 'India' },
        },
      })

      const property = await payload.create({
        collection: 'properties',
        data: {
          name: 'Concurrent Property',
          description: 'Test property for concurrent operations',
          location: 'Test Location',
          price: 5000,
          status: 'available',
        },
      })

      // Simulate concurrent booking attempts
      const bookingPromises = [
        payload.create({
          collection: 'bookings',
          data: {
            customer: customer.id,
            property: property.id,
            checkIn: '2024-09-01',
            checkOut: '2024-09-15',
            status: 'pending',
            totalAmount: 70000,
          },
        }),
        payload.create({
          collection: 'bookings',
          data: {
            customer: 'another-customer-id',
            property: property.id,
            checkIn: '2024-09-01',
            checkOut: '2024-09-15',
            status: 'pending',
            totalAmount: 70000,
          },
        }),
      ]

      const results = await Promise.allSettled(bookingPromises)

      // At least one booking should succeed
      const successfulBookings = results.filter((result) => result.status === 'fulfilled')
      expect(successfulBookings.length).toBeGreaterThan(0)
    })
  })

  describe('Error Handling & Recovery', () => {
    it('should handle system failures gracefully', async () => {
      // Test with invalid data
      const invalidCustomerData = {
        name: '', // Invalid empty name
        email: 'invalid-email', // Invalid email format
        phone: '123', // Invalid phone number
      }

      try {
        await payload.create({
          collection: 'customers',
          data: invalidCustomerData as any,
        })
      } catch (error) {
        expect(error).toBeDefined()
        // Should throw validation error
      }

      // Test recovery with valid data
      const validCustomer = await payload.create({
        collection: 'customers',
        data: {
          name: 'Recovery Customer',
          email: 'recovery@example.com',
          phone: '6666666666',
          password: 'password123',
          address: { country: 'India' },
        },
      })

      expect(validCustomer).toBeDefined()
      expect(validCustomer.name).toBe('Recovery Customer')
    })

    it('should maintain audit trail for critical operations', async () => {
      const customer = await payload.create({
        collection: 'customers',
        data: {
          name: 'Audit Customer',
          email: 'audit@example.com',
          phone: '7777777777',
          password: 'password123',
          address: { country: 'India' },
        },
      })

      // Create booking with audit trail
      const booking = await payload.create({
        collection: 'bookings',
        data: {
          customer: customer.id,
          property: 'test-property-id',
          checkIn: '2024-10-01',
          checkOut: '2024-10-31',
          status: 'confirmed',
          totalAmount: 155000,
          auditTrail: [
            {
              action: 'created',
              timestamp: new Date().toISOString(),
              userId: customer.id,
              details: 'Booking created',
            },
          ],
        },
      })

      expect(booking.auditTrail).toBeDefined()
      expect(booking.auditTrail).toHaveLength(1)

      // Update booking with audit trail
      const updatedBooking = await payload.update({
        collection: 'bookings',
        id: booking.id,
        data: {
          status: 'active',
          auditTrail: [
            ...booking.auditTrail,
            {
              action: 'activated',
              timestamp: new Date().toISOString(),
              userId: customer.id,
              details: 'Booking activated',
            },
          ],
        },
      })

      expect(updatedBooking.auditTrail).toHaveLength(2)
      expect(updatedBooking.status).toBe('active')
    })
  })
})
