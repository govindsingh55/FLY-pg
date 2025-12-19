<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { createPayment } from '../payments.remote';

	let { open = $bindable(false), customers = [], bookings = [], contracts = [] } = $props();

	let selectedCustomerId = $state('');

	// Filter bookings by selected customer
	let filteredBookings = $derived(
		bookings.filter((b) => !selectedCustomerId || b.customerId === selectedCustomerId)
	);

	// Filter contracts by selected customer
	let filteredContracts = $derived(
		contracts.filter((c) => !selectedCustomerId || c.customerId === selectedCustomerId)
	);
</script>

<Sheet.Root bind:open>
	<Sheet.Content class="overflow-y-auto w-[400px] sm:w-[540px] p-4">
		<Sheet.Header>
			<Sheet.Title>Record Payment</Sheet.Title>
			<Sheet.Description>Add a new payment record.</Sheet.Description>
		</Sheet.Header>

		<form
			class="space-y-4"
			{...createPayment.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Payment recorded successfully');
					open = false;
				} catch (e: any) {
					toast.error(e.message || 'Failed to record payment');
				}
			})}
		>
			<div class="grid gap-2">
				<Label for="customerId">Customer</Label>
				<select
					id="customerId"
					name="customerId"
					bind:value={selectedCustomerId}
					required
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="" disabled selected>Select Customer</option>
					{#each customers as customer}
						<option value={customer.id}>{customer.name}</option>
					{/each}
				</select>
				{#if createPayment.fields.customerId.issues()}
					<p class="text-sm text-destructive">
						{createPayment.fields.customerId
							.issues()
							?.map((issue) => issue.message)
							.join(', ')}
					</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="contractId">Contract (Optional)</Label>
				<select
					id="contractId"
					name="contractId"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="">None</option>
					{#each filteredContracts as contract}
						<option value={contract.id}>
							Contract {contract.id.slice(0, 8)}... ({contract.contractType}) - ${contract.rentAmount}/mo
						</option>
					{/each}
				</select>
			</div>

			<div class="grid gap-2">
				<Label for="bookingId">Booking (Optional)</Label>
				<select
					id="bookingId"
					name="bookingId"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="">None</option>
					{#each filteredBookings as booking}
						<option value={booking.id}>
							{booking.property?.name ?? 'Unknown Property'} - Room {booking.room?.number ?? '?'}
							({new Date(booking.startDate).toLocaleDateString()})
						</option>
					{/each}
				</select>
				{#if createPayment.fields.bookingId.issues()}
					<p class="text-sm text-destructive">
						{createPayment.fields.bookingId
							.issues()
							?.map((issue) => issue.message)
							.join(', ')}
					</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="amount">Amount</Label>
					<Input type="number" step="0.01" id="amount" name="amount" required min="0.01" />
					{#if createPayment.fields.amount.issues()}
						<p class="text-sm text-destructive">
							{createPayment.fields.amount
								.issues()
								?.map((issue) => issue.message)
								.join(', ')}
						</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="paymentDate">Date</Label>
					<Input
						type="date"
						id="paymentDate"
						name="paymentDate"
						value={new Date().toISOString().split('T')[0]}
						required
					/>
					{#if createPayment.fields.paymentDate.issues()}
						<p class="text-sm text-destructive">
							{createPayment.fields.paymentDate
								.issues()
								?.map((issue) => issue.message)
								.join(', ')}
						</p>
					{/if}
				</div>
			</div>

			<div class="grid grid-cols-3 gap-4">
				<div class="grid gap-2">
					<Label for="type">Type</Label>
					<select
						id="type"
						name="type"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="rent" selected>Rent</option>
						<option value="security_deposit">Security Deposit</option>
						<option value="maintenance">Maintenance</option>
						<option value="booking_charge">Booking Charge</option>
						<option value="other">Other</option>
					</select>
				</div>
				<div class="grid gap-2">
					<Label for="mode">Mode</Label>
					<select
						id="mode"
						name="mode"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="online" selected>Online</option>
						<option value="cash">Cash</option>
						<option value="upi">UPI</option>
					</select>
				</div>
				<div class="grid gap-2">
					<Label for="status">Status</Label>
					<select
						id="status"
						name="status"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="paid" selected>Paid</option>
						<option value="pending">Pending</option>
						<option value="failed">Failed</option>
						<option value="refunded">Refunded</option>
					</select>
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="transactionId">Transaction ID / Note</Label>
				<Textarea id="transactionId" {...createPayment.fields.transactionId.as('text')} />
			</div>

			<Sheet.Footer>
				<Button type="submit" disabled={!!createPayment.pending}>
					{createPayment.pending ? 'Saving...' : 'Record Payment'}
				</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
