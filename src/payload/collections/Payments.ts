import type { CollectionConfig } from 'payload'

const Payments: CollectionConfig = {
  slug: 'payments',
  admin: {
    useAsTitle: 'id',
    defaultColumns: [
      'id',
      'status',
      'amount',
      'customer',
      'payfor',
      'paymentMethod',
      'paymentSource',
      'updatedAt',
    ],
    group: 'Financial',
    description: 'Manage customer payments including online, cash, and walk-in transactions',
  },
  fields: [
    // ==================== TAB: Basic Information ====================
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Basic Information',
          description: 'Core payment details and status',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'status',
                  type: 'select',
                  options: [
                    { label: 'Initiated', value: 'initiated' },
                    { label: 'Notified', value: 'notified' },
                    { label: 'Pending', value: 'pending' },
                    { label: 'Processing', value: 'processing' },
                    { label: 'Completed', value: 'completed' },
                    { label: 'Failed', value: 'failed' },
                    { label: 'Cancelled', value: 'cancelled' },
                    { label: 'Refunded', value: 'refunded' },
                    { label: 'Partially Refunded', value: 'partially-refunded' },
                  ],
                  required: true,
                  index: true,
                  admin: {
                    width: '50%',
                    description: 'Current status of the payment',
                  },
                },
                {
                  name: 'rent',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: {
                    width: '50%',
                    description: 'Base rent amount in INR',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'amount',
                  type: 'number',
                  required: true,
                  min: 0,
                  admin: {
                    width: '100%',
                    description: 'Total payment amount (auto-calculated: rent + all charges)',
                    readOnly: true,
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'customer',
                  type: 'relationship',
                  relationTo: 'customers',
                  required: true,
                  index: true,
                  admin: {
                    width: '50%',
                  },
                },
                {
                  name: 'payfor',
                  type: 'relationship',
                  relationTo: 'bookings',
                  required: true,
                  index: true,
                  admin: {
                    width: '50%',
                    description: 'Select the booking this payment is for',
                    // Set relationship depth to populate property, room, customer for displayTitle
                    allowCreate: false,
                  },
                  // Filter to show only active/confirmed bookings
                  filterOptions: {
                    status: {
                      in: ['active', 'confirmed', 'pending'],
                    },
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'paymentForMonthAndYear',
                  type: 'date',
                  required: true,
                  admin: {
                    width: '33%',
                    description: 'Payment period (month/year)',
                  },
                },
                {
                  name: 'dueDate',
                  type: 'date',
                  required: true,
                  admin: {
                    width: '33%',
                    description: 'Payment due date',
                  },
                },
                {
                  name: 'paymentDate',
                  type: 'date',
                  admin: {
                    width: '34%',
                    description: 'Actual payment completion date',
                  },
                },
              ],
            },
            {
              type: 'collapsible',
              label: 'Additional Charges',
              admin: {
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'lateFees',
                      type: 'number',
                      min: 0,
                      defaultValue: 0,
                      admin: {
                        width: '50%',
                        description: 'Late fees applied to this payment',
                      },
                    },
                    {
                      name: 'utilityCharges',
                      type: 'number',
                      min: 0,
                      defaultValue: 0,
                      admin: {
                        width: '50%',
                        description: 'Utility charges (water, maintenance, etc.)',
                      },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'electricityUnitsConsumed',
                      type: 'number',
                      min: 0,
                      defaultValue: 0,
                      admin: {
                        width: '33%',
                        description: 'Electricity units consumed (kWh)',
                      },
                    },
                    {
                      name: 'electricityRatePerUnit',
                      type: 'number',
                      min: 0,
                      defaultValue: 0,
                      admin: {
                        width: '33%',
                        description:
                          'Rate per unit (INR/kWh) - auto-populated from property settings',
                        readOnly: true,
                      },
                    },
                    {
                      name: 'electricityCharges',
                      type: 'number',
                      min: 0,
                      defaultValue: 0,
                      admin: {
                        width: '34%',
                        description: 'Auto-calculated electricity charges',
                        readOnly: true,
                      },
                    },
                  ],
                },
              ],
            },
            {
              name: 'notes',
              type: 'textarea',
              admin: {
                description:
                  'Additional notes about this payment (who collected, special circumstances, etc.)',
              },
            },
            {
              name: 'paymentReceipt',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Upload payment receipt or proof of payment',
              },
            },
            {
              name: 'processedBy',
              type: 'relationship',
              relationTo: 'users',
              admin: {
                description: 'Admin user who processed this payment',
              },
            },
          ],
        },
        // ==================== TAB: Payment Method & Source ====================
        {
          label: 'Payment Method & Source',
          description: 'How and where the payment was made',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'paymentMethod',
                  type: 'select',
                  options: [
                    { label: 'Credit Card', value: 'credit-card' },
                    { label: 'Debit Card', value: 'debit-card' },
                    { label: 'UPI', value: 'upi' },
                    { label: 'Net Banking', value: 'net-banking' },
                    { label: 'Wallet', value: 'wallet' },
                    { label: 'Cash', value: 'cash' },
                  ],
                  defaultValue: 'upi',
                  admin: {
                    width: '50%',
                    description: 'Payment method used',
                  },
                },
                {
                  name: 'paymentSource',
                  type: 'select',
                  options: [
                    { label: 'Web Dashboard', value: 'web-dashboard' },
                    { label: 'Mobile App', value: 'mobile-app' },
                    { label: 'Admin Panel', value: 'admin-panel' },
                    { label: 'Auto-Pay', value: 'auto-pay' },
                    { label: 'Phone Call', value: 'phone-call' },
                    { label: 'Walk-in', value: 'walk-in' },
                  ],
                  defaultValue: 'web-dashboard',
                  admin: {
                    width: '50%',
                    description: 'Source through which payment was initiated',
                  },
                },
              ],
            },
            {
              name: 'paymentMethodDetails',
              type: 'group',
              label: 'Payment Method Details',
              admin: {
                description: 'Specific details about the payment method used',
                // Only show method details for online/payment methods (hide for cash)
                condition: (data) =>
                  ['credit-card', 'debit-card', 'upi', 'net-banking', 'wallet'].includes(
                    data?.paymentMethod,
                  ),
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'cardLast4',
                      type: 'text',
                      admin: {
                        width: '50%',
                        description: 'Last 4 digits of card (if applicable)',
                        // support both field-level and sibling-level contexts
                        condition: (data, siblingData) => {
                          const pm = data?.paymentMethod ?? siblingData?.paymentMethod
                          return pm === 'credit-card' || pm === 'debit-card'
                        },
                      },
                    },
                    {
                      name: 'cardType',
                      type: 'text',
                      admin: {
                        width: '50%',
                        description: 'Type of card (Visa, MasterCard, etc.)',
                        condition: (data, siblingData) => {
                          const pm = data?.paymentMethod ?? siblingData?.paymentMethod
                          return pm === 'credit-card' || pm === 'debit-card'
                        },
                      },
                    },
                  ],
                },
                {
                  name: 'upiId',
                  type: 'text',
                  admin: {
                    description: 'UPI ID used for payment',
                    condition: (data, siblingData) => {
                      const pm = data?.paymentMethod ?? siblingData?.paymentMethod
                      return pm === 'upi'
                    },
                  },
                },
                {
                  name: 'bankName',
                  type: 'text',
                  admin: {
                    description: 'Bank name for net banking',
                    condition: (data, siblingData) => {
                      const pm = data?.paymentMethod ?? siblingData?.paymentMethod
                      return pm === 'net-banking'
                    },
                  },
                },
              ],
            },
            {
              name: 'deviceInfo',
              type: 'group',
              label: 'Device Information',
              admin: {
                description: 'Information about the device used for online payments',
                // Only show device info for online/payment gateway methods
                condition: (data) =>
                  ['credit-card', 'debit-card', 'upi', 'net-banking', 'wallet'].includes(
                    data?.paymentMethod,
                  ),
              },
              fields: [
                {
                  name: 'deviceType',
                  type: 'select',
                  options: [
                    { label: 'Desktop', value: 'desktop' },
                    { label: 'Mobile', value: 'mobile' },
                    { label: 'Tablet', value: 'tablet' },
                    { label: 'Unknown', value: 'unknown' },
                  ],
                  admin: {
                    description: 'Type of device used for payment',
                  },
                },
                {
                  type: 'collapsible',
                  label: 'Technical Details',
                  admin: {
                    initCollapsed: true,
                  },
                  fields: [
                    {
                      name: 'userAgent',
                      type: 'text',
                      admin: {
                        description: 'User agent string',
                      },
                    },
                    {
                      name: 'ipAddress',
                      type: 'text',
                      admin: {
                        description: 'IP address of payment initiator',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ==================== TAB: PhonePe Gateway ====================
        {
          label: 'PhonePe Gateway',
          description: 'PhonePe payment gateway details',
          admin: {
            condition: (data) => data?.paymentMethod !== 'cash',
          },
          fields: [
            {
              name: 'gateway',
              type: 'text',
              admin: {
                description: 'Payment gateway used (phonepe, razorpay, etc.)',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'merchantOrderId',
                  type: 'text',
                  admin: {
                    width: '50%',
                    readOnly: true,
                    description: 'PhonePe merchant order ID',
                  },
                  index: true,
                },
                {
                  name: 'phonepeLastCode',
                  type: 'text',
                  admin: {
                    width: '50%',
                    readOnly: true,
                    description: 'Last response code from PhonePe',
                  },
                },
              ],
            },
            {
              name: 'phonepeLastState',
              type: 'text',
              admin: {
                readOnly: true,
                description: 'Last payment state from PhonePe',
              },
            },
            {
              name: 'phonepeLastRaw',
              label: 'PhonePe Raw Response',
              type: 'json',
              admin: {
                readOnly: true,
                description: 'Last raw response from PhonePe (click to expand)',
                components: {
                  Field: '@/payload/components/CollapsibleJsonField',
                },
              },
            },
            {
              name: 'phonepeTools',
              type: 'ui',
              label: 'PhonePe Admin Tools',
              admin: {
                components: {
                  Field: '@/payload/components/PhonePeTools',
                },
              },
            },
          ],
        },
        // ==================== TAB: Reminders & Automation ====================
        {
          label: 'Reminders & Automation',
          description: 'Payment reminder and auto-pay settings',
          fields: [
            {
              name: 'autoPayEnabled',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description: 'Enable automatic payment for future months',
              },
            },
            {
              name: 'reminderSettings',
              type: 'group',
              label: 'Reminder Settings',
              admin: {
                description: 'Configure payment reminder notifications',
              },
              fields: [
                {
                  name: 'sendReminders',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Send payment reminders to customer',
                  },
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'reminderDays',
                      type: 'number',
                      min: 1,
                      max: 30,
                      defaultValue: 7,
                      admin: {
                        width: '50%',
                        description: 'Days before due date to send reminder',
                      },
                    },
                    {
                      name: 'reminderSentAt',
                      type: 'date',
                      admin: {
                        width: '50%',
                        description: 'When the last reminder was sent',
                        readOnly: true,
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        // ==================== TAB: Analytics & Tracking ====================
        {
          label: 'Analytics & Tracking',
          description: 'Payment analytics and performance metrics',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'processingTime',
                  type: 'number',
                  admin: {
                    width: '33%',
                    description: 'Time taken to process payment (in seconds)',
                    readOnly: true,
                  },
                },
                {
                  name: 'retryCount',
                  type: 'number',
                  defaultValue: 0,
                  admin: {
                    width: '33%',
                    description: 'Number of times payment was retried',
                  },
                },
                {
                  name: 'customerSatisfactionScore',
                  type: 'number',
                  min: 1,
                  max: 5,
                  admin: {
                    width: '34%',
                    description: 'Customer satisfaction rating (1-5)',
                  },
                },
              ],
            },
            {
              name: 'lastRetryAt',
              type: 'date',
              admin: {
                description: 'Last time payment was retried',
              },
            },
          ],
        },
        // ==================== TAB: Booking Snapshot ====================
        {
          label: 'Booking Snapshot',
          description: 'Snapshot of booking data at time of payment',
          fields: [
            {
              name: 'bookingSnapshot',
              label: 'Booking Snapshot Data',
              type: 'json',
              required: false, // Allow manual payment creation without snapshot
              admin: {
                description:
                  'Snapshot of booking data at time of payment (auto-populated from booking)',
                condition: (data) => data.bookingSnapshot, // Only show if data exists
                // Use a custom component for better JSON display
                components: {
                  Field: '@/payload/components/CollapsibleJsonField',
                },
              },
              hooks: {
                beforeChange: [
                  async ({ value, data, req, operation }) => {
                    // Auto-populate snapshot from booking if not provided and booking exists
                    if (!value && data?.payfor && operation === 'create') {
                      try {
                        const payload = req.payload
                        const booking = await payload.findByID({
                          collection: 'bookings',
                          id: typeof data.payfor === 'string' ? data.payfor : data.payfor.id,
                          depth: 1,
                        })

                        if (booking) {
                          return {
                            bookingId: booking.id,
                            propertyName:
                              typeof booking.property === 'object'
                                ? booking.property.name
                                : 'Unknown',
                            roomName:
                              typeof booking.room === 'object' ? booking.room.name : 'Unknown',
                            price: booking.price,
                            foodIncluded: booking.foodIncluded,
                            checkInDate: booking.checkInDate,
                            checkOutDate: booking.checkOutDate,
                            status: booking.status,
                            snapshotDate: new Date().toISOString(),
                          }
                        }
                      } catch (error) {
                        console.error('Error auto-populating booking snapshot:', error)
                      }
                    }
                    return value
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        // Auto-populate electricityRatePerUnit from property settings
        if (data?.payfor && (!data.electricityRatePerUnit || operation === 'create')) {
          try {
            const payload = req.payload
            const booking = await payload.findByID({
              collection: 'bookings',
              id: typeof data.payfor === 'string' ? data.payfor : data.payfor.id,
              depth: 2, // Need depth 2 to get property -> electricityConfig
            })

            if (
              booking &&
              typeof booking.property === 'object' &&
              booking.property?.electricityConfig?.enabled
            ) {
              const perUnitCost = booking.property.electricityConfig.perUnitCost
              if (perUnitCost !== undefined && perUnitCost !== null) {
                data.electricityRatePerUnit = perUnitCost
              }
            }
          } catch (error) {
            console.error('Error fetching electricity rate from property:', error)
          }
        }

        // Auto-calculate electricity charges from units * rate
        if (
          data.electricityUnitsConsumed !== undefined &&
          data.electricityRatePerUnit !== undefined
        ) {
          const units = Number(data.electricityUnitsConsumed) || 0
          const rate = Number(data.electricityRatePerUnit) || 0
          data.electricityCharges = units * rate
        }

        // Auto-calculate total amount = rent + all charges
        const rent = Number(data.rent) || 0
        const lateFees = Number(data.lateFees) || 0
        const utilityCharges = Number(data.utilityCharges) || 0
        const electricityCharges = Number(data.electricityCharges) || 0

        data.amount = rent + lateFees + utilityCharges + electricityCharges

        return data
      },
    ],
  },
}

export default Payments
