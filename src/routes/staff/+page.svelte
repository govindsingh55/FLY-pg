<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '$lib/components/ui/card';
	import { Ticket, AlertCircle, CheckCircle, TrendingUp } from 'lucide-svelte';
	import { getStaffDashboard } from './staff.remote';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';

	let dataPromise = $state(getStaffDashboard());
</script>

<div class="p-6 space-y-6">
	<div>
		<h2 class="text-3xl font-bold tracking-tight">Dashboard</h2>
		<p class="text-muted-foreground">Your assigned tickets and work summary</p>
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
		{:then data}
			<!-- Staff Dashboard -->
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium">Assigned to Me</CardTitle>
						<Ticket class="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold">{data.stats.assignedToMe}</div>
						<p class="text-xs text-muted-foreground">Active tickets</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium">Open Tickets</CardTitle>
						<AlertCircle class="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold">{data.stats.openTickets}</div>
						<p class="text-xs text-muted-foreground">Unassigned</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium">Resolved Today</CardTitle>
						<CheckCircle class="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold">{data.stats.resolvedToday}</div>
						<p class="text-xs text-muted-foreground">Today's work</p>
					</CardContent>
				</Card>

				<Card>
					<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle class="text-sm font-medium">Total Resolved</CardTitle>
						<TrendingUp class="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div class="text-2xl font-bold">{data.stats.totalResolved}</div>
						<p class="text-xs text-muted-foreground">All time</p>
					</CardContent>
				</Card>
			</div>

			<!-- Assigned Tickets List -->
			<Card>
				<CardHeader>
					<CardTitle>My Assigned Tickets</CardTitle>
					<CardDescription>Tickets currently assigned to you</CardDescription>
				</CardHeader>
				<CardContent>
					{#if data.assignedTickets.length > 0}
						<div class="space-y-4">
							{#each data.assignedTickets as ticket}
								<div class="flex items-start justify-between border-b pb-4 last:border-0">
									<div class="space-y-1 flex-1">
										<div class="flex items-center gap-2 flex-wrap">
											<p class="font-medium">{ticket.subject}</p>
											<Badge
												variant={ticket.priority === 'high'
													? 'destructive'
													: ticket.priority === 'medium'
														? 'default'
														: 'secondary'}
											>
												{ticket.priority}
											</Badge>
											<Badge variant="outline">{ticket.status}</Badge>
										</div>
										<p class="text-sm text-muted-foreground line-clamp-2">
											{ticket.description}
										</p>
										<div class="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
											<span>Customer: {ticket.customer?.name || 'N/A'}</span>
											<span>Property: {ticket.property?.name || 'N/A'}</span>
											{#if ticket.room}
												<span>Room: {ticket.room.number}</span>
											{/if}
										</div>
									</div>
									<Button size="sm" href="/staff/tickets/{ticket.id}">View</Button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">No tickets assigned to you</p>
					{/if}
				</CardContent>
			</Card>
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading dashboard</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button variant="outline" onclick={() => (dataPromise = getStaffDashboard())}>Retry</Button>
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
