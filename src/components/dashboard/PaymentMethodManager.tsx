'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import { useLoading } from '@/hooks/useLoading'

interface PaymentMethod {
  id: string
  type: 'card' | 'upi' | 'bank-account' | 'wallet'
  name: string
  isDefault: boolean
  isVerified: boolean
  lastUsed?: string
  cardDetails?: {
    brand: string
    last4: string
    expMonth: number
    expYear: number
  }
  upiDetails?: {
    upiId: string
    name: string
  }
  bankDetails?: {
    bankName: string
    accountNumber: string
    ifscCode: string
  }
  walletDetails?: {
    walletName: string
    phoneNumber: string
  }
}

interface PaymentMethodManagerProps {
  className?: string
}

export function PaymentMethodManager({ className }: PaymentMethodManagerProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null)
  const [formData, setFormData] = useState({
    type: 'card',
    name: '',
    cardNumber: '',
    expMonth: '',
    expYear: '',
    cvv: '',
    upiId: '',
    upiName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
    walletName: '',
    phoneNumber: '',
    isDefault: false,
  })
  const [showCardDetails, setShowCardDetails] = useState(false)

  const { isLoading, withLoading } = useLoading()

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/custom/customers/payments/methods')
      if (!response.ok) {
        throw new Error('Failed to fetch payment methods')
      }
      const data = await response.json()
      setPaymentMethods(data)
    } catch (error) {
      console.error('Error fetching payment methods:', error)
      toast.error('Failed to load payment methods')
    }
  }

  useEffect(() => {
    withLoading(fetchPaymentMethods)
  }, [])

  const resetForm = () => {
    setFormData({
      type: 'card',
      name: '',
      cardNumber: '',
      expMonth: '',
      expYear: '',
      cvv: '',
      upiId: '',
      upiName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      walletName: '',
      phoneNumber: '',
      isDefault: false,
    })
    setShowCardDetails(false)
  }

  const handleAddMethod = async () => {
    try {
      const response = await fetch('/api/custom/customers/payments/methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to add payment method')
      }

      toast.success('Payment method added successfully')
      setIsAddDialogOpen(false)
      resetForm()
      fetchPaymentMethods()
    } catch (error) {
      console.error('Error adding payment method:', error)
      toast.error('Failed to add payment method')
    }
  }

  const handleEditMethod = async () => {
    if (!selectedMethod) return

    try {
      const response = await fetch(`/api/custom/customers/payments/methods/${selectedMethod.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to update payment method')
      }

      toast.success('Payment method updated successfully')
      setIsEditDialogOpen(false)
      setSelectedMethod(null)
      resetForm()
      fetchPaymentMethods()
    } catch (error) {
      console.error('Error updating payment method:', error)
      toast.error('Failed to update payment method')
    }
  }

  const handleDeleteMethod = async (methodId: string) => {
    try {
      const response = await fetch(`/api/custom/customers/payments/methods/${methodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete payment method')
      }

      toast.success('Payment method deleted successfully')
      fetchPaymentMethods()
    } catch (error) {
      console.error('Error deleting payment method:', error)
      toast.error('Failed to delete payment method')
    }
  }

  const handleSetDefault = async (methodId: string) => {
    try {
      const response = await fetch(`/api/custom/customers/payments/methods/${methodId}/default`, {
        method: 'PUT',
      })

      if (!response.ok) {
        throw new Error('Failed to set default payment method')
      }

      toast.success('Default payment method updated')
      fetchPaymentMethods()
    } catch (error) {
      console.error('Error setting default payment method:', error)
      toast.error('Failed to set default payment method')
    }
  }

  const openEditDialog = (method: PaymentMethod) => {
    setSelectedMethod(method)
    setFormData({
      type: method.type,
      name: method.name,
      cardNumber: method.cardDetails?.last4 ? `****${method.cardDetails.last4}` : '',
      expMonth: method.cardDetails?.expMonth?.toString() || '',
      expYear: method.cardDetails?.expYear?.toString() || '',
      cvv: '',
      upiId: method.upiDetails?.upiId || '',
      upiName: method.upiDetails?.name || '',
      bankName: method.bankDetails?.bankName || '',
      accountNumber: method.bankDetails?.accountNumber || '',
      ifscCode: method.bankDetails?.ifscCode || '',
      walletName: method.walletDetails?.walletName || '',
      phoneNumber: method.walletDetails?.phoneNumber || '',
      isDefault: method.isDefault,
    })
    setIsEditDialogOpen(true)
  }

  const getMethodIcon = (type: string) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-5 w-5" />
      case 'upi':
        return <CreditCard className="h-5 w-5" />
      case 'bank-account':
        return <CreditCard className="h-5 w-5" />
      case 'wallet':
        return <CreditCard className="h-5 w-5" />
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getMethodDisplayName = (method: PaymentMethod) => {
    switch (method.type) {
      case 'card':
        return `${method.cardDetails?.brand} •••• ${method.cardDetails?.last4}`
      case 'upi':
        return `${method.upiDetails?.name} (${method.upiDetails?.upiId})`
      case 'bank-account':
        return `${method.bankDetails?.bankName} •••• ${method.bankDetails?.accountNumber.slice(-4)}`
      case 'wallet':
        return `${method.walletDetails?.walletName} (${method.walletDetails?.phoneNumber})`
      default:
        return method.name
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Methods
              </CardTitle>
              <CardDescription>
                Manage your saved payment methods for quick and secure payments
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>Add a new payment method to your account</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="type">Payment Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="card">Credit/Debit Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                        <SelectItem value="bank-account">Bank Account</SelectItem>
                        <SelectItem value="wallet">Digital Wallet</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="name">Display Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., My HDFC Card"
                    />
                  </div>

                  {formData.type === 'card' && (
                    <>
                      <div>
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <div className="relative">
                          <Input
                            id="cardNumber"
                            type={showCardDetails ? 'text' : 'password'}
                            value={formData.cardNumber}
                            onChange={(e) =>
                              setFormData({ ...formData, cardNumber: e.target.value })
                            }
                            placeholder="1234 5678 9012 3456"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="lg"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => setShowCardDetails(!showCardDetails)}
                          >
                            {showCardDetails ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="expMonth">Month</Label>
                          <Input
                            id="expMonth"
                            value={formData.expMonth}
                            onChange={(e) => setFormData({ ...formData, expMonth: e.target.value })}
                            placeholder="MM"
                          />
                        </div>
                        <div>
                          <Label htmlFor="expYear">Year</Label>
                          <Input
                            id="expYear"
                            value={formData.expYear}
                            onChange={(e) => setFormData({ ...formData, expYear: e.target.value })}
                            placeholder="YYYY"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            type="password"
                            value={formData.cvv}
                            onChange={(e) => setFormData({ ...formData, cvv: e.target.value })}
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {formData.type === 'upi' && (
                    <>
                      <div>
                        <Label htmlFor="upiId">UPI ID</Label>
                        <Input
                          id="upiId"
                          value={formData.upiId}
                          onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                          placeholder="username@bank"
                        />
                      </div>
                      <div>
                        <Label htmlFor="upiName">Name</Label>
                        <Input
                          id="upiName"
                          value={formData.upiName}
                          onChange={(e) => setFormData({ ...formData, upiName: e.target.value })}
                          placeholder="Account holder name"
                        />
                      </div>
                    </>
                  )}

                  {formData.type === 'bank-account' && (
                    <>
                      <div>
                        <Label htmlFor="bankName">Bank Name</Label>
                        <Input
                          id="bankName"
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          placeholder="e.g., HDFC Bank"
                        />
                      </div>
                      <div>
                        <Label htmlFor="accountNumber">Account Number</Label>
                        <Input
                          id="accountNumber"
                          value={formData.accountNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, accountNumber: e.target.value })
                          }
                          placeholder="Account number"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifscCode">IFSC Code</Label>
                        <Input
                          id="ifscCode"
                          value={formData.ifscCode}
                          onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                          placeholder="e.g., HDFC0001234"
                        />
                      </div>
                    </>
                  )}

                  {formData.type === 'wallet' && (
                    <>
                      <div>
                        <Label htmlFor="walletName">Wallet Name</Label>
                        <Input
                          id="walletName"
                          value={formData.walletName}
                          onChange={(e) => setFormData({ ...formData, walletName: e.target.value })}
                          placeholder="e.g., Paytm, PhonePe"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          value={formData.phoneNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, phoneNumber: e.target.value })
                          }
                          placeholder="Registered phone number"
                        />
                      </div>
                    </>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="isDefault">Set as default payment method</Label>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleAddMethod} className="flex-1">
                      Add Method
                    </Button>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium text-muted-foreground">
                  No payment methods
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add a payment method to enable quick payments and auto-pay.
                </p>
              </div>
            ) : (
              paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {getMethodIcon(method.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{getMethodDisplayName(method)}</span>
                        {method.isDefault && (
                          <Badge variant="default" className="text-xs">
                            Default
                          </Badge>
                        )}
                        {method.isVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-yellow-600" />
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {method.lastUsed && `Last used: ${formatDate(method.lastUsed)}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Set Default
                      </Button>
                    )}
                    <Button variant="outline" size="lg" onClick={() => openEditDialog(method)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="lg">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Delete Payment Method</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete this payment method? This action cannot
                            be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                          <Button variant="outline">Cancel</Button>
                          <Button
                            onClick={() => handleDeleteMethod(method.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Delete
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Security Notice */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-900">Secure Payment Methods</h4>
                <p className="text-sm text-blue-700 mt-1">
                  Your payment information is encrypted and stored securely. We never store your CVV
                  or full card details.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Payment Method</DialogTitle>
            <DialogDescription>Update your payment method details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Display Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., My HDFC Card"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-isDefault">Set as default payment method</Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditMethod} className="flex-1">
                Update Method
              </Button>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
