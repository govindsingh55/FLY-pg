'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Save, X, Edit } from 'lucide-react'
import { toast } from 'sonner'

interface Address {
  street?: string
  city?: string
  state?: string
  pincode?: string
  country?: string
}

interface AddressFormProps {
  address?: Address
  onSave: (address: Address) => Promise<void>
  onCancel?: () => void
  isEditing?: boolean
  onEdit?: () => void
}

export function AddressForm({
  address,
  onSave,
  onCancel,
  isEditing = false,
  onEdit,
}: AddressFormProps) {
  const [formData, setFormData] = useState<Address>(
    address || {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
    },
  )
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.street?.trim()) {
      newErrors.street = 'Street address is required'
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'City is required'
    } else if (formData.city.length > 50) {
      newErrors.city = 'City name must be less than 50 characters'
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'State is required'
    } else if (formData.state.length > 50) {
      newErrors.state = 'State name must be less than 50 characters'
    }

    if (!formData.pincode?.trim()) {
      newErrors.pincode = 'PIN code is required'
    } else if (!/^[1-9][0-9]{5}$/.test(formData.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit Indian PIN code'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await onSave(formData)
      toast.success('Address updated successfully')
    } catch (error) {
      console.error('Error saving address:', error)
      toast.error('Failed to update address')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Address, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const handlePincodeChange = (value: string) => {
    // Only allow numbers and limit to 6 digits
    const numericValue = value.replace(/\D/g, '').slice(0, 6)
    handleInputChange('pincode', numericValue)
  }

  if (!isEditing && onEdit) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Address Information
          </CardTitle>
          <CardDescription>Your current address details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {address?.street && (
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Street Address</Label>
                <p className="text-sm">{address.street}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {address?.city && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">City</Label>
                  <p className="text-sm">{address.city}</p>
                </div>
              )}

              {address?.state && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">State</Label>
                  <p className="text-sm">{address.state}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {address?.pincode && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">PIN Code</Label>
                  <p className="text-sm">{address.pincode}</p>
                </div>
              )}

              {address?.country && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                  <p className="text-sm">{address.country}</p>
                </div>
              )}
            </div>

            <Button onClick={onEdit} variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Address
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          {address ? 'Edit Address' : 'Add Address'}
        </CardTitle>
        <CardDescription>
          {address ? 'Update your address information' : 'Enter your address details'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <Textarea
              id="street"
              placeholder="Enter your street address"
              value={formData.street}
              onChange={(e) => handleInputChange('street', e.target.value)}
              className={errors.street ? 'border-red-500' : ''}
            />
            {errors.street && <p className="text-sm text-red-500">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                placeholder="Enter city name"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={errors.city ? 'border-red-500' : ''}
              />
              {errors.city && <p className="text-sm text-red-500">{errors.city}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                placeholder="Enter state name"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className={errors.state ? 'border-red-500' : ''}
              />
              {errors.state && <p className="text-sm text-red-500">{errors.state}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pincode">PIN Code *</Label>
              <Input
                id="pincode"
                placeholder="Enter 6-digit PIN code"
                value={formData.pincode}
                onChange={(e) => handlePincodeChange(e.target.value)}
                maxLength={6}
                className={errors.pincode ? 'border-red-500' : ''}
              />
              {errors.pincode && <p className="text-sm text-red-500">{errors.pincode}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                placeholder="Enter country name"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-4">
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Address
                </>
              )}
            </Button>

            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
