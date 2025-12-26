<script lang="ts">
	import MediaSelection from '$lib/components/media/media-selection.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Sheet from '$lib/components/ui/sheet';
	import { Textarea } from '$lib/components/ui/textarea';
	import { toast } from 'svelte-sonner';
	import { createRoom, deleteRoom, updateRoom } from '../rooms.remote';

	let selectedImages = $state<string[]>([]);

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
			media?: { url: string; type: string }[] | null;
		} | null;
	}>();

	$effect(() => {
		if (open) {
			selectedImages = room?.media?.map((m: { url: string }) => m.url) || [];
		} else {
			selectedImages = [];
		}
	});
</script>

<Sheet.Root bind:open>
	<Sheet.Content side="right" class="w-[400px] sm:w-[540px] overflow-y-auto">
		<Sheet.Header>
			<div class="flex items-center justify-between pr-8">
				<Sheet.Title>{room ? 'Edit Room' : 'Add Room'}</Sheet.Title>
				{#if room}
					<AlertDialog.Root>
						<AlertDialog.Trigger>
							{#snippet child({ props })}
								<Button {...props} variant="destructive" size="sm">Delete</Button>
							{/snippet}
						</AlertDialog.Trigger>
						<AlertDialog.Content>
							<AlertDialog.Header>
								<AlertDialog.Title>Are you sure?</AlertDialog.Title>
								<AlertDialog.Description>
									This action cannot be undone. This will permanently delete the room and its data.
								</AlertDialog.Description>
							</AlertDialog.Header>
							<AlertDialog.Footer>
								<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
								<form
									{...deleteRoom.enhance(async ({ submit }) => {
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
									<AlertDialog.Action
										type="submit"
										class={buttonVariants({ variant: 'destructive' })}
									>
										Delete
									</AlertDialog.Action>
								</form>
							</AlertDialog.Footer>
						</AlertDialog.Content>
					</AlertDialog.Root>
				{/if}
			</div>
			<Sheet.Description>
				{room ? 'Update the details for this room.' : 'Add a new room to this property.'}
			</Sheet.Description>
		</Sheet.Header>

		{#if room}
			<!-- Update Form -->
			<form
				class="space-y-4 p-4"
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
				<input type="hidden" name="media" value={selectedImages.join(',')} />

				<MediaSelection
					value={selectedImages}
					onValueChange={(urls) => (selectedImages = urls as string[])}
					mode="multiple"
					label="Room Images"
					name=""
					gridClass="grid-cols-3 gap-2"
					{propertyId}
				/>
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

				<Sheet.Footer class="pt-4">
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
				<input type="hidden" name="media" value={selectedImages.join(',')} />

				<MediaSelection
					value={selectedImages}
					onValueChange={(urls) => (selectedImages = urls as string[])}
					mode="multiple"
					label="Room Images"
					name=""
					gridClass="grid-cols-3 gap-2"
					{propertyId}
				/>
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
