<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Building, Users, Calendar, CreditCard, Home, TrendingUp } from '@lucide/svelte';
	import { Badge } from '$lib/components/ui/badge';

	let { dashboardData } = $props<{ dashboardData: any }>();
</script>

<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium">My Properties</CardTitle>
			<Building class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">{dashboardData.stats.assignedProperties}</div>
			<p class="text-xs text-muted-foreground">
				{dashboardData.stats.totalRooms} total rooms
			</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium">Active Tenants</CardTitle>
			<Users class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">{dashboardData.stats.activeCustomers}</div>
			<p class="text-xs text-muted-foreground">Across all properties</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium">Occupancy Rate</CardTitle>
			<Home class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">{dashboardData.stats.occupancyRate}%</div>
			<p class="text-xs text-muted-foreground">
				{dashboardData.stats.occupiedRooms} of {dashboardData.stats.totalRooms} rooms
			</p>
		</CardContent>
	</Card>

	<Card>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
			<CardTitle class="text-sm font-medium">This Month Revenue</CardTitle>
			<TrendingUp class="h-4 w-4 text-muted-foreground" />
		</CardHeader>
		<CardContent>
			<div class="text-2xl font-bold">₹{dashboardData.stats.monthlyRevenue.toLocaleString()}</div>
			<p class="text-xs text-muted-foreground">From your properties</p>
		</CardContent>
	</Card>
</div>

<div class="grid gap-4 md:grid-cols-2">
	<Card>
		<CardHeader>
			<CardTitle>My Properties</CardTitle>
			<CardDescription>Properties under your management</CardDescription>
		</CardHeader>
		<CardContent>
			{#if dashboardData.assignedProperties.length > 0}
				<div class="space-y-4">
					{#each dashboardData.assignedProperties as property}
						<div class="flex items-start justify-between border-b pb-3 last:border-0">
							<div class="space-y-1">
								<p class="font-medium">{property.name}</p>
								<p class="text-sm text-muted-foreground">
									{property.city}, {property.state}
								</p>
								<div class="flex items-center gap-2 mt-1">
									<Badge variant="outline" class="text-xs">
										{property.roomCount} rooms
									</Badge>
									<Badge variant="secondary" class="text-xs">
										{property.occupiedRooms} occupied
									</Badge>
								</div>
							</div>
							<div class="text-right">
								<p class="text-sm font-medium">
									{Math.round((property.occupiedRooms / property.roomCount) * 100)}%
								</p>
								<p class="text-xs text-muted-foreground">occupancy</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">No properties assigned</p>
			{/if}
		</CardContent>
	</Card>

	<Card>
		<CardHeader>
			<CardTitle>Recent Activity</CardTitle>
			<CardDescription>Latest bookings and payments</CardDescription>
		</CardHeader>
		<CardContent>
			{#if dashboardData.recentActivity.length > 0}
				<div class="space-y-4">
					{#each dashboardData.recentActivity as activity}
						<div class="flex items-start justify-between border-b pb-3 last:border-0">
							<div class="space-y-1">
								<p class="font-medium text-sm">{activity.customer?.name}</p>
								<p class="text-xs text-muted-foreground">
									{#if activity.property}
										{activity.property.name}
										{#if activity.room}
											- Room {activity.room.number}
										{/if}
									{:else}
										Payment
									{/if}
								</p>
								<Badge variant="outline" class="text-xs">
									{activity.type}
								</Badge>
							</div>
							<div class="text-right">
								{#if activity.amount}
									<p class="text-sm font-medium">₹{activity.amount.toLocaleString()}</p>
								{/if}
								<p class="text-xs text-muted-foreground">
									{activity.createdAt && new Date(activity.createdAt).toLocaleDateString()}
								</p>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">No recent activity</p>
			{/if}
		</CardContent>
	</Card>
</div>
