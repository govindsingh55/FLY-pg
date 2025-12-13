<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();
</script>

<div class="mx-auto max-w-4xl p-6 space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-3xl font-bold tracking-tight">Booking Details</h1>
		{#if data.booking.status !== 'cancelled' && data.booking.status !== 'completed'}
			<form
				method="POST"
				action="?/cancel"
				use:enhance
				onsubmit={(e) => !confirm('Cancel this booking?') && e.preventDefault()}
			>
				<Button variant="destructive" type="submit">Cancel Booking</Button>
			</form>
		{/if}
	</div>

	<div class="grid gap-6 md:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Reservation Info</CardTitle>
			</CardHeader>
			<CardContent class="grid gap-2">
				<div class="flex justify-between">
					<span class="text-muted-foreground">Status:</span>
					<Badge>{data.booking.status}</Badge>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Dates:</span>
					<span
						>{new Date(data.booking.startDate).toLocaleDateString()} - {data.booking.endDate
							? new Date(data.booking.endDate).toLocaleDateString()
							: 'Ongoing'}</span
					>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Rent:</span>
					<span>${data.booking.rentAmount}/mo</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Security Deposit:</span>
					<span>${data.booking.securityDeposit ?? 0}</span>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Property & Customer</CardTitle>
			</CardHeader>
			<CardContent class="grid gap-2">
				<div class="flex justify-between">
					<span class="text-muted-foreground">Property:</span>
					<span>{data.booking.property?.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Room:</span>
					<span>{data.booking.room?.number} ({data.booking.room?.type})</span>
				</div>
				<div class="border-t my-2"></div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Customer:</span>
					<span>{data.booking.customer?.name}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Contact:</span>
					<span>{data.booking.customer?.phone}</span>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Payments List -->
	<Card>
		<CardHeader class="flex flex-row items-center justify-between">
			<CardTitle>Payments</CardTitle>
			<!-- Actions to add payment would go here -->
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Date</Table.Head>
						<Table.Head>Amount</Table.Head>
						<Table.Head>Type</Table.Head>
						<Table.Head>Status</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.booking.payments as payment}
						<Table.Row>
							<Table.Cell
								>{payment.paymentDate
									? new Date(payment.paymentDate).toLocaleDateString()
									: '-'}</Table.Cell
							>
							<Table.Cell>${payment.amount}</Table.Cell>
							<Table.Cell class="capitalize">{payment.type}</Table.Cell>
							<Table.Cell class="capitalize">{payment.status}</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={4} class="h-24 text-center">No payments recorded.</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>
</div>
