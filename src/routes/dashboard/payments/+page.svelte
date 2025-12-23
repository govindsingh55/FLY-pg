<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';
	import { getPayments } from './payments.remote';
	import PaymentSubmissionForm from './_components/payment-submission-form.svelte';

	let dataPromise = $state(getPayments());
	let submitFormOpen = $state(false);
</script>

<div class="flex h-full flex-col gap-4 p-6">
	<svelte:boundary>
		{#await dataPromise}
			<div class="flex items-center justify-between">
				<div>
					<Skeleton class="h-8 w-48 mb-2" />
					<Skeleton class="h-4 w-64" />
				</div>
			</div>

			<div class="rounded-md border p-4">
				<div class="space-y-4">
					{#each { length: 5 } as _}
						<Skeleton class="h-12 w-full" />
					{/each}
				</div>
			</div>
		{:then { payments }}
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold tracking-tight">Payment History</h1>
					<p class="text-muted-foreground">View your rent and deposit payments.</p>
				</div>
				<Button onclick={() => (submitFormOpen = true)}>
					<Plus class="mr-2 h-4 w-4" />
					Submit Payment
				</Button>
			</div>

			<div class="rounded-md border">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Date</Table.Head>
							<Table.Head>Property / Room</Table.Head>
							<Table.Head>Amount</Table.Head>
							<Table.Head>Type</Table.Head>
							<Table.Head>Mode</Table.Head>
							<Table.Head>Status</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each payments as payment}
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
									{:else if payment.contract}
										<div class="flex flex-col">
											<span>{payment.contract.property?.name ?? 'Unknown Property'}</span>
											<span class="text-xs text-muted-foreground"
												>Room {payment.contract.room?.number ?? '?'}</span
											>
										</div>
									{:else}
										<span class="text-muted-foreground italic">General</span>
									{/if}
								</Table.Cell>
								<Table.Cell>${payment.amount}</Table.Cell>
								<Table.Cell class="capitalize">{payment.type.replace('_', ' ')}</Table.Cell>
								<Table.Cell class="capitalize">{payment.mode}</Table.Cell>
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
								<Table.Cell colspan={6} class="h-24 text-center"
									>No active payments found.</Table.Cell
								>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</div>
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading payments</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button variant="outline" onclick={() => (dataPromise = getPayments())}>Retry</Button>
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

<PaymentSubmissionForm bind:open={submitFormOpen} />
