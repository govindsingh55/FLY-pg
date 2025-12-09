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

import { headers } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function StaffPropertiesPage() {
  const payload = await getPayload({ config: configPromise })
  const headersList = await headers()
  const { user } = await payload.auth({ headers: headersList })

  if (!user || user.collection !== 'users' || !['manager', 'admin'].includes((user as any).role)) {
    redirect('/staff/dashboard')
  }

  const properties = await payload.find({
    collection: 'properties',
    limit: 50,
    sort: 'name',
    depth: 1,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
        <p className="text-muted-foreground">Overview of all managed properties.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Properties</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Manager</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {properties.docs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No properties found.
                  </TableCell>
                </TableRow>
              ) : (
                properties.docs.map((property: any) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">{property.name}</TableCell>
                    <TableCell>{property.propertyType}</TableCell>
                    <TableCell>{property.address?.location?.city || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={property.status === 'active' ? 'default' : 'secondary'}>
                        {property.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{property.manager?.name || 'Unassigned'}</TableCell>
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
