<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Building, Users, Calendar, CreditCard } from '@lucide/svelte';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';

	let { dashboardData } = $props<{ dashboardData: any }>();
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium">Total Properties</CardTitle>
			<Building class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">{dashboardData.stats.totalProperties}</div>
			<p class="text-xs text-muted-foreground">
				{dashboardData.stats.totalRooms} total rooms
			</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium">Active Customers</CardTitle>
			<Users class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">{dashboardData.stats.activeCustomers}</div>
			<p class="text-xs text-muted-foreground">
				{dashboardData.stats.totalCustomers} total customers
			</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium">Active Bookings</CardTitle>
			<Calendar class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">{dashboardData.stats.activeBookings}</div>
			<p class="text-xs text-muted-foreground">
				{dashboardData.stats.occupancyRate}% occupancy
			</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium">This Month Revenue</CardTitle>
			<CreditCard class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">₹{dashboardData.stats.monthlyRevenue.toLocaleString()}</div>
			<p class="text-xs text-muted-foreground">
				{dashboardData.stats.pendingPayments} pending payments
			</p>
		</CardContent>
	</Card>
</div>

<div class="grid gap-4 md:grid-cols-2">
	<Card>
		<CardHeader>
			<CardTitle>Recent Bookings</CardTitle>
			<CardDescription>Latest booking activity</CardDescription>
		</CardHeader>
		<CardContent>
			{#if dashboardData.recentBookings.length > 0}
				<div class="space-y-4">
					{#each dashboardData.recentBookings as booking}
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium">{booking.customer?.name}</p>
								<p class="text-sm text-muted-foreground">
									{booking.property?.name} - Room {booking.room?.number}
								</p>
							</div>
							<span class="text-sm text-muted-foreground">
								{booking.createdAt && new Date(booking.createdAt).toLocaleDateString()}
							</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">No recent bookings</p>
			{/if}
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Recent Payments</CardTitle>
			<CardDescription>Latest payment transactions</CardDescription>
		</CardHeader>
		<CardContent>
			{#if dashboardData.recentPayments.length > 0}
				<div class="space-y-4">
					{#each dashboardData.recentPayments as payment}
						<div class="flex items-center justify-between">
							<div>
								<p class="font-medium">{payment.customer?.name}</p>
								<p class="text-sm text-muted-foreground capitalize">
									{payment.type.replace('_', ' ')}
								</p>
							</div>
							<span class="text-sm font-medium">₹{payment.amount.toLocaleString()}</span>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">No recent payments</p>
			{/if}
		</CardContent>
	</Card>
</div>
