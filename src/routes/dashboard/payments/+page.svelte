<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();
</script>

<div class="flex h-full flex-col gap-4 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Payment History</h1>
			<p class="text-muted-foreground">View your rent and deposit payments.</p>
		</div>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Date</Table.Head>
					<Table.Head>Property / Room</Table.Head>
					<Table.Head>Amount</Table.Head>
					<Table.Head>Type</Table.Head>
					<Table.Head>Status</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.payments as payment}
					<Table.Row>
						<Table.Cell>
							{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
						</Table.Cell>
						<Table.Cell>
							{#if payment.booking}
								<div class="flex flex-col">
									<span>{payment.booking.property?.name ?? 'Unknown Property'}</span>
									<span class="text-xs text-muted-foreground"
										>Room {payment.booking.room?.number ?? '?'}</span
									>
								</div>
							{:else}
								<span class="text-muted-foreground italic">General</span>
							{/if}
						</Table.Cell>
						<Table.Cell>${payment.amount}</Table.Cell>
						<Table.Cell class="capitalize">{payment.type.replace('_', ' ')}</Table.Cell>
						<Table.Cell>
							<Badge
								variant={payment.status === 'paid'
									? 'default'
									: payment.status === 'pending'
										? 'secondary'
										: payment.status === 'refunded'
											? 'outline'
											: 'destructive'}
							>
								{payment.status}
							</Badge>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={5} class="h-24 text-center">No active payments found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
