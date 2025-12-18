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
	import { page } from '$app/stores';
	import { createRoom } from '../../../rooms.remote';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let propertyId = $derived($page.params.id);
</script>

<div class="mx-auto max-w-xl p-6">
	<Card>
		<CardHeader>
			<CardTitle>Add Room</CardTitle>
			<CardDescription>Add a new room to this property.</CardDescription>
		</CardHeader>
		<form
			{...createRoom.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Room created successfully');
					goto(`/admin/properties/${propertyId}`);
				} catch (e: any) {
					toast.error(e.message || 'Failed to create room');
				}
			})}
		>
			<CardContent class="grid gap-4">
				<input type="hidden" name="propertyId" value={propertyId} />
				<div class="grid gap-2">
					<Label for="number">Room Number</Label>
					<Input id="number" name="number" placeholder="101" required />
					{#if createRoom.fields.number.issues()}
						<p class="text-destructive text-sm">
							{createRoom.fields.number.issues()?.[0].message}
						</p>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label for="type">Room Type</Label>
					<select
						name="type"
						id="type"
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="single">Single</option>
						<option value="double">Double</option>
						<option value="triple">Triple</option>
						<option value="dorm">Dorm</option>
					</select>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="capacity">Capacity (People)</Label>
						<Input type="number" id="capacity" name="capacity" min="1" required />
						{#if createRoom.fields.capacity.issues()}
							<p class="text-destructive text-sm">
								{createRoom.fields.capacity.issues()?.[0].message}
							</p>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label for="priceMonthly">Monthly Price</Label>
						<Input type="number" id="priceMonthly" name="priceMonthly" min="0" required />
						{#if createRoom.fields.priceMonthly.issues()}
							<p class="text-destructive text-sm">
								{createRoom.fields.priceMonthly.issues()?.[0].message}
							</p>
						{/if}
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="depositAmount">Security Deposit</Label>
					<Input type="number" id="depositAmount" name="depositAmount" min="0" />
					{#if createRoom.fields.depositAmount.issues()}
						<p class="text-destructive text-sm">
							{createRoom.fields.depositAmount.issues()?.[0].message}
						</p>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label for="status">Status</Label>
					<select
						name="status"
						id="status"
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="available">Available</option>
						<option value="occupied">Occupied</option>
						<option value="maintenance">Maintenance</option>
					</select>
				</div>
			</CardContent>
			<CardFooter class="justify-between">
				<Button variant="ghost" href="/admin/properties/{propertyId}">Cancel</Button>
				<Button type="submit" disabled={!!createRoom.pending}>
					{createRoom.pending ? 'Creating...' : 'Create Room'}
				</Button>
			</CardFooter>
		</form>
	</Card>
</div>
