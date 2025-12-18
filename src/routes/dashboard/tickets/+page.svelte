<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import { Plus } from 'lucide-svelte';
	import { getTickets } from '../../admin/tickets/tickets.remote';
	import TicketForm from './_components/ticket-form.svelte';

	let isFormOpen = $state(false);
	let dataPromise = $derived(getTickets({ pageSize: 100 })); // Show all for customer for now
</script>

<div class="flex h-full flex-col gap-4 p-6">
	<svelte:boundary>
		{#await dataPromise}
			<div class="flex items-center justify-between">
				<div>
					<Skeleton class="h-8 w-48 mb-2" />
					<Skeleton class="h-4 w-64" />
				</div>
				<Skeleton class="h-10 w-32" />
			</div>

			<div class="rounded-md border p-4">
				<div class="space-y-4">
					{#each { length: 5 } as _}
						<Skeleton class="h-12 w-full" />
					{/each}
				</div>
			</div>
		{:then { tickets }}
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold tracking-tight">Your Tickets</h1>
					<p class="text-muted-foreground">Track status of your maintenance requests.</p>
				</div>
				<Button onclick={() => (isFormOpen = true)}>
					<Plus class="mr-2 h-4 w-4" />
					New Ticket
				</Button>

				<svelte:boundary>
					<TicketForm bind:open={isFormOpen} />
					{#snippet failed(error: any, reset)}
						<p class="text-xs text-destructive">Form unavailable: {error.message}</p>
					{/snippet}
				</svelte:boundary>
			</div>

			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Subject</Table.Head>
							<Table.Head>Type</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Priority</Table.Head>
							<Table.Head>Date</Table.Head>
							<Table.Head class="text-right">Action</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each tickets as ticket}
							<Table.Row>
								<Table.Cell class="font-medium">
									{ticket.subject}
								</Table.Cell>
								<Table.Cell class="capitalize">{ticket.type}</Table.Cell>
								<Table.Cell>
									<Badge variant="outline">{ticket.status}</Badge>
								</Table.Cell>
								<Table.Cell>
									<Badge
										variant={ticket.priority === 'high'
											? 'destructive'
											: ticket.priority === 'medium'
												? 'default'
												: 'secondary'}
									>
										{ticket.priority}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button variant="outline" size="sm" href={`/dashboard/tickets/${ticket.id}`}>
										View & Chat
									</Button>
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={5} class="h-24 text-center">No tickets found.</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading tickets</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button variant="outline" onclick={() => (dataPromise = getTickets({ pageSize: 100 }))}
					>Retry</Button
				>
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
