<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import { enhance } from '$app/forms';

	let { data, form } = $props();

	let selectedBookingId = $state('');
	let selectedCustomerId = $state('');

	// If booking is selected, auto-select customer
	$effect(() => {
		if (selectedBookingId) {
			const booking = data.bookings.find((b) => b.id === selectedBookingId);
			if (booking) {
				selectedCustomerId = booking.customerId;
			}
		}
	});
</script>

<div class="mx-auto max-w-2xl p-6">
	<Card>
		<CardHeader>
			<CardTitle>Record Payment</CardTitle>
			<CardDescription>Log a rent or deposit payment.</CardDescription>
		</CardHeader>
		<form method="POST" use:enhance>
			<CardContent class="grid gap-4">
				<!-- Booking Selection (Optional but recommended for rent) -->
				<div class="grid gap-2">
					<Label for="bookingId">Link to Booking (Optional)</Label>
					<select
						name="bookingId"
						id="bookingId"
						bind:value={selectedBookingId}
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">-- No Booking / General Payment --</option>
						{#each data.bookings as booking}
							<option value={booking.id}>
								{booking.customer?.name} - {booking.property?.name} (Room {booking.room?.number}) - {new Date(
									booking.startDate
								).toLocaleDateString()}
							</option>
						{/each}
					</select>
				</div>

				<!-- Customer Selection -->
				<div class="grid gap-2">
					<Label for="customerId">Customer</Label>
					<select
						name="customerId"
						id="customerId"
						bind:value={selectedCustomerId}
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						required
					>
						<option value="">Select Customer</option>
						{#each data.customers as customer}
							<option value={customer.id}>{customer.name} ({customer.email})</option>
						{/each}
					</select>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="amount">Amount</Label>
						<Input type="number" id="amount" name="amount" min="0" step="0.01" required />
					</div>
					<div class="grid gap-2">
						<Label for="paymentDate">Payment Date</Label>
						<Input
							type="date"
							id="paymentDate"
							name="paymentDate"
							value={new Date().toISOString().split('T')[0]}
							required
						/>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="type">Payment Type</Label>
						<select
							name="type"
							id="type"
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="rent">Rent</option>
							<option value="security_deposit">Security Deposit</option>
							<option value="maintenance">Maintenance</option>
							<option value="other">Other</option>
						</select>
					</div>
					<div class="grid gap-2">
						<Label for="status">Status</Label>
						<select
							name="status"
							id="status"
							class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="paid">Paid</option>
							<option value="pending">Pending</option>
							<option value="failed">Failed</option>
						</select>
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="paymentMethod">Payment Method</Label>
						<Input id="paymentMethod" name="paymentMethod" placeholder="Cash, Check, Online" />
					</div>
					<div class="grid gap-2">
						<Label for="transactionId">Transaction ID</Label>
						<Input id="transactionId" name="transactionId" placeholder="Optional" />
					</div>
				</div>
			</CardContent>
			<CardFooter class="justify-between">
				<Button variant="ghost" href="/admin/payments">Cancel</Button>
				<Button type="submit">Record Payment</Button>
			</CardFooter>
		</form>
	</Card>
</div>
