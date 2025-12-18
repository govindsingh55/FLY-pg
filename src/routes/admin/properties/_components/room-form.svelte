<script lang="ts">
	import * as Sheet from '$lib/components/ui/sheet';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Label } from '$lib/components/ui/label';
	import { createRoom, updateRoom, deleteRoom } from '../rooms.remote';
	import { toast } from 'svelte-sonner';

	let {
		open = $bindable(false),
		propertyId,
		room = null
	} = $props<{
		open: boolean;
		propertyId?: string;
		room?: {
			id: string;
			number: string;
			type: string;
			capacity: number;
			priceMonthly: number;
			depositAmount?: number | null;
			status: string;
			features?: string[] | null;
			images?: string[] | null;
		} | null;
	}>();
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="right" class="w-[400px] sm:w-[540px] overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title>{room ? 'Edit Room' : 'Add Room'}</Sheet.Title>
			<Sheet.Description>
				{room ? 'Update the details for this room.' : 'Add a new room to this property.'}
			</Sheet.Description>
		</Sheet.Header>

		{#if room}
			<!-- Update Form -->
			<form
				class="space-y-4 py-4"
				{...updateRoom.enhance(async ({ submit }) => {
					try {
						await submit();
						toast.success('Room updated successfully');
						open = false;
					} catch (e: any) {
						toast.error(e.message || 'Failed to update room');
					}
				})}
			>
				<input type="hidden" name="id" value={room.id} />
				<div class="grid gap-2">
					<Label for="number">Room Number</Label>
					<Input id="number" name="number" value={room.number} required />
					{#if updateRoom.fields.number.issues()}
						<p class="text-destructive text-sm">{updateRoom.fields.number.issues()?.[0].message}</p>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label for="type">Room Type</Label>
					<select
						name="type"
						id="type"
						value={room.type}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="single">Single</option>
						<option value="double">Double</option>
						<option value="triple">Triple</option>
						<option value="dorm">Dorm</option>
					</select>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="capacity">Capacity</Label>
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
						<Label for="priceMonthly">Price/Month</Label>
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
					<Label for="features">Features (comma separated)</Label>
					<Textarea
						id="features"
						name="features"
						value={room.features?.join(', ') ?? ''}
						placeholder="AC, Balcony, WiFi"
					/>
				</div>

				<div class="grid gap-2">
					<Label for="images">Images (URLs, comma separated)</Label>
					<Textarea
						id="images"
						name="images"
						value={room.images?.join(', ') ?? ''}
						placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
					/>
				</div>

				<div class="grid gap-2">
					<Label for="status">Status</Label>
					<select
						name="status"
						id="status"
						value={room.status}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="available">Available</option>
						<option value="occupied">Occupied</option>
						<option value="maintenance">Maintenance</option>
					</select>
				</div>

				<Sheet.Footer class="flex justify-between items-center gap-4 pt-4">
					<form
						{...deleteRoom.enhance(async ({ submit }) => {
							if (!confirm('Are you sure you want to delete this room?')) return;
							try {
								await submit();
								toast.success('Room deleted');
								open = false;
							} catch (e: any) {
								toast.error(e.message || 'Failed to delete room');
							}
						})}
					>
						<input type="hidden" name="id" value={room.id} />
						<Button variant="destructive" type="submit" disabled={!!deleteRoom.pending}>
							{deleteRoom.pending ? 'Deleting...' : 'Delete Room'}
						</Button>
					</form>

					<Button type="submit" disabled={!!updateRoom.pending}>
						{updateRoom.pending ? 'Saving...' : 'Save Changes'}
					</Button>
				</Sheet.Footer>
			</form>
		{:else}
			<!-- Create Form -->
			<form
				class="space-y-4 py-4"
				{...createRoom.enhance(async ({ submit }) => {
					try {
						await submit();
						toast.success('Room created successfully');
						open = false;
					} catch (e: any) {
						toast.error(e.message || 'Failed to create room');
					}
				})}
			>
				<input type="hidden" name="propertyId" value={propertyId} />
				<div class="grid gap-2">
					<Label for="number">Room Number</Label>
					<Input id="number" name="number" placeholder="101" required />
					{#if createRoom.fields.number.issues()}
						<p class="text-destructive text-sm">{createRoom.fields.number.issues()?.[0].message}</p>
					{/if}
				</div>

				<div class="grid gap-2">
					<Label for="type">Room Type</Label>
					<select
						name="type"
						id="type"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="single">Single</option>
						<option value="double">Double</option>
						<option value="triple">Triple</option>
						<option value="dorm">Dorm</option>
					</select>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="capacity">Capacity</Label>
						<Input type="number" id="capacity" name="capacity" min="1" required />
						{#if createRoom.fields.capacity.issues()}
							<p class="text-destructive text-sm">
								{createRoom.fields.capacity.issues()?.[0].message}
							</p>
						{/if}
					</div>
					<div class="grid gap-2">
						<Label for="priceMonthly">Price/Month</Label>
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
					<Label for="features">Features (comma separated)</Label>
					<Textarea id="features" name="features" placeholder="AC, Balcony, WiFi" />
				</div>

				<div class="grid gap-2">
					<Label for="images">Images (URLs, comma separated)</Label>
					<Textarea
						id="images"
						name="images"
						placeholder="https://example.com/img1.jpg, https://example.com/img2.jpg"
					/>
				</div>

				<div class="grid gap-2">
					<Label for="status">Status</Label>
					<select
						name="status"
						id="status"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="available">Available</option>
						<option value="occupied">Occupied</option>
						<option value="maintenance">Maintenance</option>
					</select>
				</div>

				<Sheet.Footer>
					<Button type="submit" disabled={!!createRoom.pending}>
						{createRoom.pending ? 'Creating...' : 'Create Room'}
					</Button>
				</Sheet.Footer>
			</form>
		{/if}
	</Sheet.Content>
</Sheet.Root>
