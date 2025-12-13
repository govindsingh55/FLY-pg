<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Building, Users, Calendar, CreditCard } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="p-6 space-y-6">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
		<p class="text-muted-foreground">Overview of your property management system</p>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Total Properties</CardTitle>
				<Building class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.totalProperties}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.totalRooms} total rooms
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Active Customers</CardTitle>
				<Users class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.activeCustomers}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.totalCustomers} total customers
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">Active Bookings</CardTitle>
				<Calendar class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">{data.stats.activeBookings}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.occupancyRate}% occupancy
				</p>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
				<CardTitle class="text-sm font-medium">This Month Revenue</CardTitle>
				<CreditCard class="h-4 w-4 text-muted-foreground" />
			</CardHeader>
			<CardContent>
				<div class="text-2xl font-bold">₹{data.stats.monthlyRevenue.toLocaleString()}</div>
				<p class="text-xs text-muted-foreground">
					{data.stats.pendingPayments} pending payments
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
				{#if data.recentBookings.length > 0}
					<div class="space-y-4">
						{#each data.recentBookings as booking}
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
				{#if data.recentPayments.length > 0}
					<div class="space-y-4">
						{#each data.recentPayments as payment}
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
</div>
