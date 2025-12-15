<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';

	export let data;
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-3xl font-bold tracking-tight">Visit Management</h2>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Date & Time</Table.Head>
					<Table.Head>Property</Table.Head>
					<Table.Head>Customer</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.visits as visit}
					<Table.Row>
						<Table.Cell>
							<div class="font-medium">{new Date(visit.visitDate).toLocaleDateString()}</div>
							<div class="text-xs text-muted-foreground">
								{new Date(visit.visitTime).toLocaleTimeString([], {
									hour: '2-digit',
									minute: '2-digit'
								})}
							</div>
						</Table.Cell>
						<Table.Cell>{visit.property?.name}</Table.Cell>
						<Table.Cell>
							<div>{visit.customer?.name}</div>
							<div class="text-xs text-muted-foreground">{visit.customer?.phone}</div>
						</Table.Cell>
						<Table.Cell>
							<Badge
								variant={visit.status === 'accepted'
									? 'default'
									: visit.status === 'pending'
										? 'secondary'
										: 'destructive'}
							>
								{visit.status}
							</Badge>
						</Table.Cell>
						<Table.Cell class="text-right">
							{#if visit.status === 'pending'}
								<div class="flex justify-end gap-2">
									<form method="POST" action="?/updateStatus" use:enhance>
										<input type="hidden" name="visitId" value={visit.id} />
										<input type="hidden" name="status" value="accepted" />
										<Button size="sm" variant="default" type="submit">Accept</Button>
									</form>
									<form method="POST" action="?/updateStatus" use:enhance>
										<input type="hidden" name="visitId" value={visit.id} />
										<input type="hidden" name="status" value="rejected" />
										<Button size="sm" variant="ghost" type="submit">Reject</Button>
									</form>
								</div>
							{/if}
						</Table.Cell>
					</Table.Row>
				{/each}
				{#if data.visits.length === 0}
					<Table.Row>
						<Table.Cell colspan={5} class="text-center text-muted-foreground h-24">
							No visits found.
						</Table.Cell>
					</Table.Row>
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</div>
