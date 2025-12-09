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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function StaffCustomersPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || user.collection !== 'users' || !['manager', 'admin'].includes((user as any).role)) {
    redirect('/staff/dashboard')
  }

  const customers = await payload.find({
    collection: 'customers',
    limit: 50,
    sort: '-createdAt',
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          View contact details and status of all registered tenants.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tenant Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>City</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.docs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No customers found.
                  </TableCell>
                </TableRow>
              ) : (
                customers.docs.map((customer: any) => (
                  <TableRow key={customer.id}>
                    <TableCell className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={customer.profilePicture?.url} />
                        <AvatarFallback>{customer.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.name}</span>
                    </TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>
                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                        {customer.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{customer.address?.city || '-'}</TableCell>
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
