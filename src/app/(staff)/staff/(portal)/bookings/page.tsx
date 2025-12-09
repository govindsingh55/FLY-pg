import React from 'react'
import { getPayload } from 'payload'
import configPromise from '@/payload/payload.config'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function StaffBookingsPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || user.collection !== 'users' || !['manager', 'admin'].includes((user as any).role)) {
    redirect('/staff/dashboard')
  }

  const bookings = await payload.find({
    collection: 'bookings',
    limit: 50,
    sort: '-createdAt',
    depth: 1,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
        <p className="text-muted-foreground">View recent booking activity across properties.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.docs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.docs.map((booking: any) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-mono text-xs">{booking.id.slice(-6)}</TableCell>
                    <TableCell>{booking.customer?.name || 'Unknown'}</TableCell>
                    <TableCell>{booking.property?.name || 'Unknown'}</TableCell>
                    <TableCell>{booking.room?.name || 'Unknown'}</TableCell>
                    <TableCell>
                      <Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {booking.createdAt ? format(new Date(booking.createdAt), 'PP') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
