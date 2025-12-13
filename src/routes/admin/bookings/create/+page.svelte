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

	let selectedPropertyId = $state('');

	// Derived selected property to get its rooms
	let selectedProperty = $derived(data.properties.find((p) => p.id === selectedPropertyId));
</script>

<div class="mx-auto max-w-2xl p-6">
	<Card>
		<CardHeader>
			<CardTitle>create Booking</CardTitle>
			<CardDescription>Create a new reservation for a customer.</CardDescription>
		</CardHeader>
		<form method="POST" use:enhance>
			<CardContent class="grid gap-4">
				<!-- Customer Selection -->
				<div class="grid gap-2">
					<Label for="customerId">Customer</Label>
					<select
						name="customerId"
						id="customerId"
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						required
					>
						<option value="">Select Customer</option>
						{#each data.customers as customer}
							<option value={customer.id}>{customer.name} ({customer.email})</option>
						{/each}
					</select>
				</div>

				<!-- Property Selection -->
				<div class="grid gap-2">
					<Label for="propertyId">Property</Label>
					<select
						name="propertyId"
						id="propertyId"
						bind:value={selectedPropertyId}
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						required
					>
						<option value="">Select Property</option>
						{#each data.properties as prop}
							<option value={prop.id}>{prop.name}</option>
						{/each}
					</select>
				</div>

				<!-- Room Selection (Dependant on Property) -->
				<div class="grid gap-2">
					<Label for="roomId">Room</Label>
					<select
						name="roomId"
						id="roomId"
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
						required
					>
						<option value="">Select Room</option>
						{#if selectedProperty}
							{#each selectedProperty.rooms as room}
								<option value={room.id}>
									Room {room.number} ({room.type}) - ${room.priceMonthly}/mo
								</option>
							{/each}
						{:else}
							<option disabled>Please select a property first</option>
						{/if}
					</select>
				</div>

				<!-- Dates -->
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="startDate">Start Date</Label>
						<Input type="date" id="startDate" name="startDate" required />
					</div>
					<div class="grid gap-2">
						<Label for="endDate">End Date (Optional)</Label>
						<Input
							type="date"
							id="endDate"
							name="endDate"
							placeholder="Leave empty for indefinite"
						/>
					</div>
				</div>

				<!-- Financials -->
				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="rentAmount">Rent Amount</Label>
						<Input type="number" id="rentAmount" name="rentAmount" required />
					</div>
					<div class="grid gap-2">
						<Label for="securityDeposit">Security Deposit</Label>
						<Input type="number" id="securityDeposit" name="securityDeposit" />
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="status">Status</Label>
					<select
						name="status"
						id="status"
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="pending">Pending</option>
						<option value="active">Active</option>
					</select>
				</div>
			</CardContent>
			<CardFooter class="justify-between">
				<Button variant="ghost" href="/admin/bookings">Cancel</Button>
				<Button type="submit">Create Booking</Button>
			</CardFooter>
		</form>
	</Card>
</div>
