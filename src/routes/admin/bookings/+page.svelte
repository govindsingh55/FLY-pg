<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();
</script>

<div class="flex h-full flex-col gap-4 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Bookings</h1>
			<p class="text-muted-foreground">Manage reservations and bookings.</p>
		</div>
		<Button href="/admin/bookings/create">
			<Plus class="mr-2 h-4 w-4" />
			New Booking
		</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Customer</Table.Head>
					<Table.Head>Property / Room</Table.Head>
					<Table.Head>Dates</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.bookings as booking}
					<Table.Row>
						<Table.Cell class="font-medium">
							<div class="flex flex-col">
								<span>{booking.customer?.name}</span>
								<span class="text-xs text-muted-foreground">{booking.customer?.email}</span>
							</div>
						</Table.Cell>
						<Table.Cell>
							<div class="flex flex-col">
								<span>{booking.property?.name}</span>
								<span class="text-xs text-muted-foreground">Room {booking.room?.number}</span>
							</div>
						</Table.Cell>
						<Table.Cell>
							<div class="flex flex-col">
								<span
									>{new Date(booking.startDate).toLocaleDateString()} - {booking.endDate
										? new Date(booking.endDate).toLocaleDateString()
										: 'Ongoing'}</span
								>
							</div>
						</Table.Cell>
						<Table.Cell>
							<Badge
								variant={booking.status === 'active'
									? 'default'
									: booking.status === 'pending'
										? 'secondary'
										: booking.status === 'cancelled'
											? 'destructive'
											: 'outline'}
							>
								{booking.status}
							</Badge>
						</Table.Cell>
						<Table.Cell class="text-right">
							<Button variant="ghost" size="sm" href="/admin/bookings/{booking.id}">Details</Button>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={5} class="h-24 text-center">No bookings found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
