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
			<h1 class="text-3xl font-bold tracking-tight">Your Tickets</h1>
			<p class="text-muted-foreground">Track status of your maintenance requests.</p>
		</div>
		<Button href="/dashboard/tickets/create">
			<Plus class="mr-2 h-4 w-4" />
			New Ticket
		</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Date</Table.Head>
					<Table.Head>Type</Table.Head>
					<Table.Head>Description</Table.Head>
					<Table.Head>Priority</Table.Head>
					<Table.Head>Status</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.tickets as ticket}
					<Table.Row>
						<Table.Cell>
							{ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString() : '-'}
						</Table.Cell>
						<Table.Cell class="capitalize">{ticket.type}</Table.Cell>
						<Table.Cell class="max-w-[300px] truncate" title={ticket.description}>
							{ticket.description}
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
							<Badge variant="outline">{ticket.status}</Badge>
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
</div>
