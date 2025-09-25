import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, CheckCircle, CreditCard, Home, TrendingUp, User } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s what&apos;s happening with your account.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild>
            <Link href="/dashboard/bookings">
              <Calendar className="mr-2 h-4 w-4" />
              View Bookings
            </Link>
          </Button>
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 sm:p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">+1 from last month</p>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm font-medium">Monthly Rent</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold">₹15,000</div>
            <p className="text-xs text-muted-foreground">Due in 5 days</p>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold">Up to date</div>
            <p className="text-xs text-muted-foreground">No pending payments</p>
          </CardContent>
        </Card>

        <Card className="p-4 sm:p-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-0 pt-0">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <div className="text-2xl font-bold">₹45,000</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions and alerts */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick actions */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks and shortcuts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/dashboard/profile">
                  <User className="mb-2 h-6 w-6" />
                  Update Profile
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/dashboard/rent">
                  <CreditCard className="mb-2 h-6 w-6" />
                  Pay Rent
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/dashboard/bookings">
                  <Calendar className="mb-2 h-6 w-6" />
                  View Bookings
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex-col" asChild>
                <Link href="/dashboard/settings">
                  <User className="mb-2 h-6 w-6" />
                  Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest transactions and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 rounded-full bg-green-600"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Rent payment completed</p>
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
                <Badge variant="secondary">₹15,000</Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Booking extended</p>
                  <p className="text-xs text-muted-foreground">1 week ago</p>
                </div>
                <Badge variant="outline">Extended</Badge>
              </div>

              <div className="flex items-center space-x-4">
                <div className="h-2 w-2 rounded-full bg-yellow-600"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Maintenance request</p>
                  <p className="text-xs text-muted-foreground">2 weeks ago</p>
                </div>
                <Badge variant="outline">Pending</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming payments */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Payments</CardTitle>
          <CardDescription>Your scheduled payments and due dates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 p-4 border rounded-lg sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Monthly Rent</p>
                  <p className="text-sm text-muted-foreground">Room 101, FLY Colive</p>
                </div>
              </div>
              <div className="flex flex-col items-start gap-2 sm:items-end sm:gap-0">
                <div className="text-right">
                  <p className="font-medium">₹15,000</p>
                  <p className="text-sm text-muted-foreground">Due in 5 days</p>
                </div>
                <Button size="lg">Pay Now</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
