<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Building, Users, Calendar, CreditCard } from 'lucide-svelte';
	import { getDashboardStats } from './admin.remote';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';

	let dataPromise = $state(getDashboardStats());
</script>

<div class="p-6 space-y-6">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
		<p class="text-muted-foreground">Overview of your property management system</p>
	</div>

	<svelte:boundary>
		{#await dataPromise}
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				{#each { length: 4 } as _}
					<Card>
						<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
							<Skeleton class="h-4 w-24" />
							<Skeleton class="h-4 w-4 rounded-full" />
						</CardHeader>
						<CardContent>
							<Skeleton class="h-8 w-16 mb-1" />
							<Skeleton class="h-3 w-32" />
						</CardContent>
					</Card>
				{/each}
			</div>
			<div class="grid gap-4 md:grid-cols-2">
				{#each { length: 2 } as _}
					<Card>
						<CardHeader>
							<Skeleton class="h-6 w-32 mb-2" />
							<Skeleton class="h-4 w-48" />
						</CardHeader>
						<CardContent>
							<div class="space-y-4">
								{#each { length: 5 } as _}
									<div class="flex items-center justify-between">
										<div class="space-y-1">
											<Skeleton class="h-4 w-32" />
											<Skeleton class="h-3 w-48" />
										</div>
										<Skeleton class="h-4 w-16" />
									</div>
								{/each}
							</div>
						</CardContent>
					</Card>
				{/each}
			</div>
		{:then data}
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
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading dashboard</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button variant="outline" onclick={() => (dataPromise = getDashboardStats())}>Retry</Button>
			</div>
		{/await}
		{#snippet failed(error: any, reset)}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Something went wrong</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button onclick={reset}>Try again</Button>
			</div>
		{/snippet}
	</svelte:boundary>
</div>
