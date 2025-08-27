import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { validateCustomerSession, customerRateLimiter } from '@/lib/auth/customer-auth'

export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!customerRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validate customer session
    const { user, error } = await validateCustomerSession(req)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Get the form data
    const formData = await req.formData()
    const file = formData.get('profilePicture') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 },
      )
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 5MB' }, { status: 400 })
    }

    // Get current customer to check if they have an existing avatar
    const currentCustomer = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 1,
    })

    // Create media record
    const media = await payload.create({
      collection: 'media',
      data: {
        alt: `Profile picture for ${user.name || user.email}`,
      },
      file: {
        data: await file.arrayBuffer(),
        mimetype: file.type,
        name: file.name,
        size: file.size,
      } as any,
      overrideAccess: true,
    })

    // Update customer with new avatar
    const updatedCustomer = await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        profilePicture: media.id,
      },
      overrideAccess: true,
    })

    // If there was a previous avatar, delete it
    if (
      currentCustomer?.profilePicture &&
      typeof currentCustomer.profilePicture === 'object' &&
      currentCustomer.profilePicture.id
    ) {
      try {
        await payload.delete({
          collection: 'media',
          id: currentCustomer.profilePicture.id,
          overrideAccess: true,
        })
      } catch (deleteError) {
        console.error('Error deleting old avatar:', deleteError)
        // Don't fail the request if old avatar deletion fails
      }
    }

    return NextResponse.json({
      customer: updatedCustomer,
      profilePicture: media,
      message: 'Avatar updated successfully',
    })
  } catch (error: any) {
    console.error('Error uploading avatar:', error)

    if (error.errors) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 },
      )
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Rate limiting
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown'
    if (!customerRateLimiter.isAllowed(clientIP)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validate customer session
    const { user, error } = await validateCustomerSession(req)
    if (!user) {
      return NextResponse.json({ error: error || 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Get current customer
    const currentCustomer = await payload.findByID({
      collection: 'customers',
      id: user.id,
      depth: 1,
    })

    if (
      !currentCustomer?.profilePicture ||
      typeof currentCustomer.profilePicture !== 'object' ||
      !currentCustomer.profilePicture.id
    ) {
      return NextResponse.json({ error: 'No avatar to delete' }, { status: 404 })
    }

    // Delete the avatar media
    await payload.delete({
      collection: 'media',
      id: currentCustomer.profilePicture.id,
      overrideAccess: true,
    })

    // Update customer to remove avatar reference
    const updatedCustomer = await payload.update({
      collection: 'customers',
      id: user.id,
      data: {
        profilePicture: null,
      },
      overrideAccess: true,
    })

    return NextResponse.json({
      customer: updatedCustomer,
      message: 'Avatar deleted successfully',
    })
  } catch (error: any) {
    console.error('Error deleting avatar:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
