<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { createBooking } from '../bookings.remote';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false), properties = [], customers = [] } = $props();

	let selectedPropertyId = $state('');
	// Derived rooms from selected property
	let rooms = $derived(
		selectedPropertyId ? properties.find((p) => p.id === selectedPropertyId)?.rooms || [] : []
	);
</script>

<Sheet.Root bind:open>
	<Sheet.Content class="overflow-y-auto w-[400px] sm:w-[540px]">
		<Sheet.Header>
			<Sheet.Title>Add New Booking</Sheet.Title>
			<Sheet.Description>Create a new booking record.</Sheet.Description>
		</Sheet.Header>

		<form
			method="POST"
			class="space-y-4 py-4"
			{...createBooking.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Booking created successfully');
					open = false;
				} catch (e: any) {
					toast.error(e.message || 'Failed to create booking');
				}
			})}
		>
			<div class="grid gap-2">
				<Label for="propertyId">Property</Label>
				<select
					id="propertyId"
					name="propertyId"
					bind:value={selectedPropertyId}
					required
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="" disabled selected>Select Property</option>
					{#each properties as property}
						<option value={property.id}>{property.name}</option>
					{/each}
				</select>
				{#if createBooking.fields.propertyId.errors}
					<p class="text-sm text-destructive">{createBooking.fields.propertyId.errors}</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="roomId">Room</Label>
				<select
					id="roomId"
					name="roomId"
					required
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="" disabled selected>Select Room</option>
					{#each rooms as room}
						<option value={room.id}>{room.number} ({room.type})</option>
					{/each}
				</select>
				{#if createBooking.fields.roomId.errors}
					<p class="text-sm text-destructive">{createBooking.fields.roomId.errors}</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="customerId">Customer</Label>
				<select
					id="customerId"
					name="customerId"
					required
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="" disabled selected>Select Customer</option>
					{#each customers as customer}
						<option value={customer.id}>{customer.name} ({customer.phone})</option>
					{/each}
				</select>
				{#if createBooking.fields.customerId.errors}
					<p class="text-sm text-destructive">{createBooking.fields.customerId.errors}</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="startDate">Start Date</Label>
					<Input type="date" id="startDate" name="startDate" required />
					{#if createBooking.fields.startDate.errors}
						<p class="text-sm text-destructive">{createBooking.fields.startDate.errors}</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="endDate">End Date</Label>
					<Input type="date" id="endDate" name="endDate" />
					{#if createBooking.fields.endDate.errors}
						<p class="text-sm text-destructive">{createBooking.fields.endDate.errors}</p>
					{/if}
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="rentAmount">Rent Amount</Label>
					<Input type="number" id="rentAmount" name="rentAmount" required min="0" />
					{#if createBooking.fields.rentAmount.errors}
						<p class="text-sm text-destructive">{createBooking.fields.rentAmount.errors}</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="securityDeposit">Security Deposit</Label>
					<Input type="number" id="securityDeposit" name="securityDeposit" min="0" />
					{#if createBooking.fields.securityDeposit.errors}
						<p class="text-sm text-destructive">{createBooking.fields.securityDeposit.errors}</p>
					{/if}
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="status">Status</Label>
				<select
					id="status"
					name="status"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="pending">Pending</option>
					<option value="active" selected>Active</option>
					<option value="completed">Completed</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</div>

			<Sheet.Footer>
				<Button type="submit" disabled={!!createBooking.pending}>
					{createBooking.pending ? 'Saving...' : 'Create Booking'}
				</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
