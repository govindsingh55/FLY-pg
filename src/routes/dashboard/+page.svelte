<script lang="ts">
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';

	let { data } = $props();
</script>

<div class="space-y-6 p-6">
	{#if !data.customer}
		<Card>
			<CardHeader>
				<CardTitle>Profile Setup Required</CardTitle>
				<CardDescription>We couldn't find a tenant profile linked to your account.</CardDescription>
			</CardHeader>
			<CardContent>
				<p>Please contact support or waiting for admin approval.</p>
			</CardContent>
		</Card>
	{:else}
		<!-- Active Booking / Room Info -->
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			<Card>
				<CardHeader>
					<CardTitle>Current Stay</CardTitle>
					<CardDescription>Your active room details.</CardDescription>
				</CardHeader>
				<CardContent>
					{#if data.customer.bookings.length > 0}
						{@const booking = data.customer.bookings[0]}
						<div class="text-2xl font-bold">{booking.property?.name}</div>
						<div class="text-muted-foreground">Room {booking.room?.number}</div>
						<div class="mt-4 text-sm">
							<div class="flex justify-between">
								<span>Rent:</span>
								<span class="font-medium">${booking.contract?.rentAmount || 'N/A'}/mo</span>
							</div>
							<div class="flex justify-between">
								<span>Move-in:</span>
								<span
									>{booking.contract?.startDate
										? new Date(booking.contract.startDate).toLocaleDateString()
										: 'N/A'}</span
								>
							</div>
						</div>
					{:else}
						<p class="text-muted-foreground">No active bookings found.</p>
					{/if}
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Account Status</CardTitle>
					<CardDescription>Your profile status.</CardDescription>
				</CardHeader>
				<CardContent>
					<div class="flex flex-col gap-2">
						<div class="flex justify-between items-center">
							<span class="text-muted-foreground">Profile:</span>
							<Badge variant={data.customer.status === 'active' ? 'default' : 'secondary'}
								>{data.customer.status?.toUpperCase()}</Badge
							>
						</div>
						<div class="flex justify-between items-center">
							<span class="text-muted-foreground">Email:</span>
							<span>{data.customer.email}</span>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<!-- Trigger edit profile if needed or support -->
					<Button variant="outline" size="sm">Contact Support</Button>
				</CardFooter>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Quick Actions</CardTitle>
				</CardHeader>
				<CardContent class="grid gap-2">
					<Button href="/dashboard/tickets/create" variant="secondary">Raise a Ticket</Button>
					<Button href="/dashboard/payments" variant="outline">View Payments</Button>
				</CardContent>
			</Card>
		</div>

		<!-- Recent Payments -->
		<Card>
			<CardHeader>
				<CardTitle>Recent Payments</CardTitle>
				<CardDescription>Your last 5 transactions.</CardDescription>
			</CardHeader>
			<CardContent>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Date</Table.Head>
							<Table.Head>Type</Table.Head>
							<Table.Head>Amount</Table.Head>
							<Table.Head>Status</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.customer.payments as payment}
							<Table.Row>
								<Table.Cell
									>{payment?.paymentDate
										? new Date(payment.paymentDate).toLocaleDateString()
										: ''}</Table.Cell
								>
								<Table.Cell class="capitalize">{payment.type.replace('_', ' ')}</Table.Cell>
								<Table.Cell>${payment.amount}</Table.Cell>
								<Table.Cell>
									<Badge variant={payment.status === 'paid' ? 'default' : 'secondary'}
										>{payment.status}</Badge
									>
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={4} class="text-center text-muted-foreground">
									No recent payments.
								</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</CardContent>
		</Card>
	{/if}
</div>
