'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  CreditCard,
  MoreHorizontal,
  RefreshCw,
  FileText,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLoading } from '@/hooks/useLoading'

interface Payment {
  id: string
  amount: number
  status: string
  paymentMethod: string
  paymentDate: string
  dueDate: string
  paymentForMonthAndYear: string
  lateFees: number
  utilityCharges: number
  notes?: string
  createdAt: string
  updatedAt: string
  paymentReceipt?: {
    id: string
    filename: string
    url: string
  }
  booking?: {
    id: string
    startDate: string
    endDate: string
    property?: {
      name: string
      location?: string
    }
    room?: {
      name: string
      type: string
    }
  }
  phonepeMerchantTransactionId?: string
  phonepeTransactionId?: string
  customerSatisfactionScore?: number
  paymentSource?: string
}

interface PaymentHistoryProps {
  className?: string
}

export function PaymentHistory({ className }: PaymentHistoryProps) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [methodFilter, setMethodFilter] = useState('all')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { isLoading, withLoading } = useLoading()

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/custom/customers/payments')
      if (!response.ok) {
        throw new Error('Failed to fetch payments')
      }
      const data = await response.json()
      setPayments(data.payments || [])
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Failed to load payment history')
    }
  }

  useEffect(() => {
    withLoading(fetchPayments)
  }, [])

  useEffect(() => {
    let filtered = [...payments]

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (payment) =>
          payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.booking?.property?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.booking?.room?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.status === statusFilter)
    }

    // Apply method filter
    if (methodFilter !== 'all') {
      filtered = filtered.filter((payment) => payment.paymentMethod === methodFilter)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Payment]
      let bValue: any = b[sortBy as keyof Payment]

      if (sortBy === 'amount') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (sortBy === 'paymentDate' || sortBy === 'dueDate' || sortBy === 'createdAt') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredPayments(filtered)
  }, [payments, searchTerm, statusFilter, methodFilter, sortBy, sortOrder])

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, icon: Clock },
      processing: { variant: 'secondary' as const, icon: RefreshCw },
      completed: { variant: 'default' as const, icon: CheckCircle },
      failed: { variant: 'destructive' as const, icon: XCircle },
      cancelled: { variant: 'destructive' as const, icon: XCircle },
      refunded: { variant: 'outline' as const, icon: RefreshCw },
      'partially-refunded': { variant: 'outline' as const, icon: RefreshCw },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPaymentMethodIcon = (method: string) => {
    const methodIcons: Record<string, React.ComponentType<{ className?: string }>> = {
      'credit-card': CreditCard,
      'debit-card': CreditCard,
      upi: CreditCard,
      'net-banking': CreditCard,
      wallet: CreditCard,
      cash: CreditCard,
    }

    const Icon = methodIcons[method] || CreditCard
    return <Icon className="h-4 w-4" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const handleDownloadReceipt = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/custom/customers/payments/${paymentId}?download=true`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `payment-receipt-${paymentId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success('Receipt downloaded successfully')
      } else {
        throw new Error('Failed to download receipt')
      }
    } catch (error) {
      console.error('Error downloading receipt:', error)
      toast.error('Failed to download receipt')
    }
  }

  const handleViewDetails = (payment: Payment) => {
    setSelectedPayment(payment)
    setIsDetailsOpen(true)
  }

  const handleRefresh = () => {
    withLoading(fetchPayments)
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment History
              </CardTitle>
              <CardDescription>View and manage your payment history</CardDescription>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="lg" disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="refunded">Refunded</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="credit-card">Credit Card</SelectItem>
                    <SelectItem value="debit-card">Debit Card</SelectItem>
                    <SelectItem value="net-banking">Net Banking</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="paymentDate">Payment Date</SelectItem>
                    <SelectItem value="dueDate">Due Date</SelectItem>
                    <SelectItem value="amount">Amount</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </div>

          {/* Payment Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {isLoading ? 'Loading payments...' : 'No payments found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-mono text-sm">{payment.id.slice(-8)}</TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(payment.amount)}
                        {(payment.lateFees > 0 || payment.utilityCharges > 0) && (
                          <div className="text-xs text-muted-foreground">
                            +{formatCurrency(payment.lateFees + payment.utilityCharges)} fees
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="flex items-center gap-2">
                        {getPaymentMethodIcon(payment.paymentMethod)}
                        <span className="capitalize">
                          {payment.paymentMethod.replace('-', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(payment.paymentDate || payment.createdAt)}</div>
                          {payment.dueDate && (
                            <div className="text-xs text-muted-foreground">
                              Due: {formatDate(payment.dueDate)}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {payment.booking?.property?.name ? (
                          <div className="text-sm">
                            <div className="font-medium">{payment.booking.property.name}</div>
                            {payment.booking.room?.name && (
                              <div className="text-xs text-muted-foreground">
                                {payment.booking.room.name}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(payment)}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            {payment.paymentReceipt && (
                              <DropdownMenuItem onClick={() => handleDownloadReceipt(payment.id)}>
                                <Download className="mr-2 h-4 w-4" />
                                Download Receipt
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Summary */}
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div>Total Payments: {filteredPayments.length}</div>
            <div>
              Total Amount: {formatCurrency(filteredPayments.reduce((sum, p) => sum + p.amount, 0))}
            </div>
            <div>Completed: {filteredPayments.filter((p) => p.status === 'completed').length}</div>
            <div>Pending: {filteredPayments.filter((p) => p.status === 'pending').length}</div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>Detailed information about the selected payment</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment ID</label>
                  <p className="font-mono text-sm">{selectedPayment.id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <p className="text-lg font-semibold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Payment Method
                  </label>
                  <p className="flex items-center gap-2">
                    {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                    <span className="capitalize">
                      {selectedPayment.paymentMethod.replace('-', ' ')}
                    </span>
                  </p>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Payment Date</label>
                  <p>{formatDate(selectedPayment.paymentDate || selectedPayment.createdAt)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Due Date</label>
                  <p>{formatDate(selectedPayment.dueDate)}</p>
                </div>
              </div>

              {/* Fees */}
              {(selectedPayment.lateFees > 0 || selectedPayment.utilityCharges > 0) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedPayment.lateFees > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Late Fees</label>
                      <p className="text-red-600">{formatCurrency(selectedPayment.lateFees)}</p>
                    </div>
                  )}
                  {selectedPayment.utilityCharges > 0 && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">
                        Utility Charges
                      </label>
                      <p>{formatCurrency(selectedPayment.utilityCharges)}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Booking Information */}
              {selectedPayment.booking && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Booking Details
                  </label>
                  <div className="mt-2 rounded-lg border p-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium">Property:</span>
                        <p className="text-sm">{selectedPayment.booking.property?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Room:</span>
                        <p className="text-sm">{selectedPayment.booking.room?.name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">Start Date:</span>
                        <p className="text-sm">{formatDate(selectedPayment.booking.startDate)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium">End Date:</span>
                        <p className="text-sm">{formatDate(selectedPayment.booking.endDate)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Satisfaction Score */}
              {selectedPayment.customerSatisfactionScore && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Satisfaction Score
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-4 w-4 ${
                          star <= selectedPayment.customerSatisfactionScore!
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-sm text-muted-foreground">
                      ({selectedPayment.customerSatisfactionScore}/5)
                    </span>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedPayment.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Notes</label>
                  <p className="text-sm mt-1">{selectedPayment.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                {selectedPayment.paymentReceipt && (
                  <Button
                    onClick={() => handleDownloadReceipt(selectedPayment.id)}
                    variant="outline"
                    size="lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Receipt
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
