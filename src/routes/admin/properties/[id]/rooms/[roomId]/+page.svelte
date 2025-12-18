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
	import { getRoom, updateRoom, deleteRoom } from '../../../rooms.remote';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Trash } from 'lucide-svelte';

	let roomId = $derived($page.params.roomId);
	let propertyId = $derived($page.params.id);
	let roomPromise = $derived(getRoom(roomId as string));
</script>

<div class="mx-auto max-w-xl p-6">
	<svelte:boundary>
		{#await roomPromise}
			<Card>
				<CardHeader>
					<Skeleton class="h-8 w-48 mb-2" />
					<Skeleton class="h-4 w-64" />
				</CardHeader>
				<CardContent class="space-y-4">
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
				</CardContent>
			</Card>
		{:then { room }}
			<Card>
				<CardHeader>
					<CardTitle>Edit Room {room.number}</CardTitle>
					<CardDescription>Update room details.</CardDescription>
				</CardHeader>
				<form
					{...updateRoom.enhance(async ({ submit }) => {
						try {
							await submit();
							toast.success('Room updated successfully');
						} catch (e: any) {
							toast.error(e.message || 'Failed to update room');
						}
					})}
				>
					<CardContent class="grid gap-4">
						<input type="hidden" name="id" value={room.id} />
						<div class="grid gap-2">
							<Label for="number">Room Number</Label>
							<Input id="number" name="number" value={room.number} required />
							{#if updateRoom.fields.number.issues()}
								<p class="text-destructive text-sm">
									{updateRoom.fields.number.issues()?.[0].message}
								</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<Label for="type">Room Type</Label>
							<select
								name="type"
								id="type"
								value={room.type}
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
								<Input
									type="number"
									id="capacity"
									name="capacity"
									value={room.capacity}
									min="1"
									required
								/>
								{#if updateRoom.fields.capacity.issues()}
									<p class="text-destructive text-sm">
										{updateRoom.fields.capacity.issues()?.[0].message}
									</p>
								{/if}
							</div>
							<div class="grid gap-2">
								<Label for="priceMonthly">Monthly Price</Label>
								<Input
									type="number"
									id="priceMonthly"
									name="priceMonthly"
									value={room.priceMonthly}
									min="0"
									required
								/>
								{#if updateRoom.fields.priceMonthly.issues()}
									<p class="text-destructive text-sm">
										{updateRoom.fields.priceMonthly.issues()?.[0].message}
									</p>
								{/if}
							</div>
						</div>

						<div class="grid gap-2">
							<Label for="depositAmount">Security Deposit</Label>
							<Input
								type="number"
								id="depositAmount"
								name="depositAmount"
								value={room.depositAmount}
								min="0"
							/>
							{#if updateRoom.fields.depositAmount.issues()}
								<p class="text-destructive text-sm">
									{updateRoom.fields.depositAmount.issues()?.[0].message}
								</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<Label for="status">Status</Label>
							<select
								name="status"
								id="status"
								value={room.status}
								class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="available">Available</option>
								<option value="occupied">Occupied</option>
								<option value="maintenance">Maintenance</option>
							</select>
						</div>
					</CardContent>
					<CardFooter class="justify-between">
						<div class="flex gap-2">
							<Button variant="ghost" href="/admin/properties/{propertyId}">Back</Button>
						</div>
						<Button type="submit" disabled={!!updateRoom.pending}>
							{updateRoom.pending ? 'Saving...' : 'Save Changes'}
						</Button>
					</CardFooter>
				</form>
				<div class="px-6 pb-6">
					<form
						{...deleteRoom.enhance(async ({ submit }) => {
							if (!confirm('Are you sure you want to delete this room?')) return;
							try {
								await submit();
								toast.success('Room deleted');
								goto(`/admin/properties/${propertyId}`);
							} catch (e: any) {
								toast.error(e.message || 'Failed to delete room');
							}
						})}
					>
						<input type="hidden" name="id" value={room.id} />
						<Button variant="destructive" type="submit" disabled={!!deleteRoom.pending}>
							<Trash class="mr-2 h-4 w-4" />
							Delete Room
						</Button>
					</form>
				</div>
			</Card>
		{/await}
		{#snippet failed(error: any, reset)}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading room</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button onclick={reset}>Try again</Button>
			</div>
		{/snippet}
	</svelte:boundary>
</div>
