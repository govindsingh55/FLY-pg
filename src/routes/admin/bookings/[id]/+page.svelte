<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { page } from '$app/stores';
	import { getBooking, cancelBooking, deleteBooking } from '../bookings.remote';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { ArrowLeft, Trash } from 'lucide-svelte';

	let id = $derived($page.params.id ?? '');
	let bookingPromise = $derived(getBooking(id));
</script>

<div class="mx-auto max-w-4xl p-6 space-y-6">
	<!-- back button -->
	<Button variant="outline" onclick={() => goto('/admin/bookings')}>
		<ArrowLeft class="mr-2 h-4 w-4" />
		Back
	</Button>
	<svelte:boundary>
		{#await bookingPromise}
			<div class="space-y-6">
				<div class="flex justify-between">
					<Skeleton class="h-10 w-48" />
					<Skeleton class="h-10 w-32" />
				</div>
				<div class="grid gap-6 md:grid-cols-2">
					<Skeleton class="h-48 w-full" />
					<Skeleton class="h-48 w-full" />
				</div>
			</div>
		{:then { booking }}
			<div class="flex items-center justify-between">
				<h1 class="text-3xl font-bold tracking-tight">Booking Details</h1>
				<div class="flex space-x-2">
					{#if booking.status !== 'cancelled' && booking.status !== 'completed'}
						<form
							{...cancelBooking.enhance(async ({ submit }) => {
								if (!confirm('Cancel this booking?')) return;
								try {
									await submit();
									toast.success('Booking cancelled');
								} catch (e: any) {
									toast.error(e.message || 'Failed to cancel');
								}
							})}
						>
							<input type="hidden" name="id" value={booking.id} />
							<Button variant="outline" type="submit" disabled={!!cancelBooking.pending}>
								{cancelBooking.pending ? 'Cancelling...' : 'Cancel Booking'}
							</Button>
						</form>
					{/if}

					<form
						{...deleteBooking.enhance(async ({ submit }) => {
							if (!confirm('Delete this booking record?')) return;
							try {
								await submit();
								toast.success('Booking deleted');
								goto('/admin/bookings');
							} catch (e: any) {
								toast.error(e.message || 'Failed to delete');
							}
						})}
					>
						<input type="hidden" name="id" value={booking.id} />
						<Button variant="destructive" type="submit" disabled={!!deleteBooking.pending}>
							<Trash class="mr-2 h-4 w-4" />
							{deleteBooking.pending ? 'Deleting...' : 'Delete'}
						</Button>
					</form>
				</div>
			</div>

			<div class="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Reservation Info</CardTitle>
					</CardHeader>
					<CardContent class="grid gap-2">
						<div class="flex justify-between">
							<span class="text-muted-foreground">Status:</span>
							<Badge>{booking.status}</Badge>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Dates:</span>
							<span
								>{booking.contract?.startDate
									? new Date(booking.contract.startDate).toLocaleDateString()
									: 'N/A'} - {booking.contract?.endDate
									? new Date(booking.contract.endDate).toLocaleDateString()
									: 'Ongoing'}</span
							>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Rent:</span>
							<span>${booking.contract?.rentAmount ?? 'N/A'}/mo</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Security Deposit:</span>
							<span>${booking.contract?.securityDeposit ?? 0}</span>
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
							<span>{booking.property?.name}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Room:</span>
							<span>{booking.room?.number} ({booking.room?.type})</span>
						</div>
						<div class="border-t my-2"></div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Customer:</span>
							<span>{booking.customer?.name}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-muted-foreground">Contact:</span>
							<span>{booking.customer?.phone}</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<!-- Payments List -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between">
					<CardTitle>Payments</CardTitle>
					<Button variant="outline" size="sm" href="/admin/payments?bookingId={booking.id}">
						View All in Payments
					</Button>
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
							{#each booking.payments as payment}
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
									<Table.Cell colspan={4} class="h-24 text-center">No payments recorded.</Table.Cell
									>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</CardContent>
			</Card>
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading booking</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button variant="outline" href="/admin/bookings">Go Back</Button>
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
