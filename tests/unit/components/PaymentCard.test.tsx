import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { PaymentCard } from '@/components/dashboard/PaymentCard'

// Mock the Link component
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

describe('PaymentCard Component', () => {
  const mockPayment = {
    id: 'payment-1',
    amount: 5000,
    status: 'completed',
    paymentDate: '2024-01-15T10:00:00Z',
    dueDate: '2024-01-10T10:00:00Z',
    paymentForMonthAndYear: 'January 2024',
    payfor: {
      id: 'booking-1',
      property: {
        name: 'Test Property',
        location: 'Test Location',
      },
      roomSnapshot: {
        name: 'Room 101',
      },
    },
    bookingSnapshot: {
      propertyName: 'Test Property',
      roomName: 'Room 101',
    },
  }

  beforeEach(() => {
    cleanup()
  })

  it('should render payment information correctly', () => {
    render(<PaymentCard payment={mockPayment} />)

    expect(screen.getByText('₹5,000')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
    expect(screen.getByText('Test Property')).toBeInTheDocument()
    // The text "Room 101" is split across elements, so we need to use a more flexible matcher
    expect(screen.getByText(/Room 101/)).toBeInTheDocument()
  })

  it('should display correct status badge color', () => {
    render(<PaymentCard payment={mockPayment} />)

    const statusBadge = screen.getByText('completed')
    expect(statusBadge).toHaveClass('bg-green-100', 'text-green-800')
  })

  it('should show pending status with correct styling', () => {
    const pendingPayment = { ...mockPayment, status: 'pending' }
    render(<PaymentCard payment={pendingPayment} />)

    const statusBadge = screen.getByText('pending')
    expect(statusBadge).toHaveClass('bg-yellow-100', 'text-yellow-800')
  })

  it('should show failed status with correct styling', () => {
    const failedPayment = { ...mockPayment, status: 'failed' }
    render(<PaymentCard payment={failedPayment} />)

    const statusBadge = screen.getByText('failed')
    expect(statusBadge).toHaveClass('bg-red-100', 'text-red-800')
  })

  it('should format amount correctly', () => {
    const largeAmountPayment = { ...mockPayment, amount: 150000 }
    render(<PaymentCard payment={largeAmountPayment} />)

    expect(screen.getByText('₹1,50,000')).toBeInTheDocument()
  })

  it('should show payment date in correct format', () => {
    render(<PaymentCard payment={mockPayment} />)

    // The component uses toLocaleDateString() which formats as "15/1/2024"
    expect(screen.getByText('15/1/2024')).toBeInTheDocument()
  })

  it('should show due date when available', () => {
    render(<PaymentCard payment={mockPayment} />)

    // The component uses toLocaleDateString() which formats as "10/1/2024"
    expect(screen.getByText('10/1/2024')).toBeInTheDocument()
  })

  it('should show payment month and year when available', () => {
    render(<PaymentCard payment={mockPayment} />)

    // The text is split across elements, so we need to use a more flexible matcher
    expect(screen.getByText(/Payment for January 2024/)).toBeInTheDocument()
  })

  it('should handle missing property information gracefully', () => {
    const paymentWithoutProperty = {
      ...mockPayment,
      payfor: undefined,
      bookingSnapshot: undefined,
    }

    render(<PaymentCard payment={paymentWithoutProperty} />)

    expect(screen.getByText('₹5,000')).toBeInTheDocument()
    expect(screen.getByText('completed')).toBeInTheDocument()
  })

  it('should show actions when showActions prop is true', () => {
    render(<PaymentCard payment={mockPayment} showActions={true} />)

    // Use getAllByText and check for at least one instance
    const viewDetailsButtons = screen.getAllByText('View Details')
    expect(viewDetailsButtons.length).toBeGreaterThan(0)
    
    const downloadReceiptButtons = screen.getAllByText('Download Receipt')
    expect(downloadReceiptButtons.length).toBeGreaterThan(0)
  })

  it('should not show actions when showActions prop is false', () => {
    render(<PaymentCard payment={mockPayment} showActions={false} />)

    expect(screen.queryByText('View Details')).not.toBeInTheDocument()
    expect(screen.queryByText('Download Receipt')).not.toBeInTheDocument()
  })
})
