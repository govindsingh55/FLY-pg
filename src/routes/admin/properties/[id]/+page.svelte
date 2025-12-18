<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription,
		CardFooter
	} from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Plus, Trash, Pencil } from 'lucide-svelte';
	import { page } from '$app/state';
	import { getProperty, updateProperty, deleteProperty } from '../properties.remote';
	import { getAmenities } from '../../amenities/amenities.remote';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import RoomForm from '../_components/room-form.svelte';
	import * as Select from '$lib/components/ui/select';

	let id = $derived(page.params.id);
	let dataPromise = $derived(getProperty(id as string));
	let amenitiesPromise = $derived(getAmenities());

	let roomSheetOpen = $state(false);
	let selectedRoom = $state<any>(null); // Using any or specific type if available
	let selectedAmenities = $state<string[]>([]);
	let nearbyItems = $state<any[]>([{ title: '', distance: '', image: '' }]);

	$effect(() => {
		dataPromise.then((data) => {
			if (data.property?.amenities) {
				selectedAmenities = data.property.amenities.map((a: any) => a.amenityId);
			}
			if (data.property?.nearby) {
				const raw = data.property.nearby as any;
				if (Array.isArray(raw)) {
					if (raw.length > 0 && typeof raw[0] === 'string') {
						nearbyItems = raw.map((s: string) => ({ title: s, distance: '', image: '' }));
					} else {
						nearbyItems = raw;
					}
				} else if (typeof raw === 'string') {
					try {
						const parsed = JSON.parse(raw);
						if (Array.isArray(parsed)) {
							if (parsed.length > 0 && typeof parsed[0] === 'string') {
								nearbyItems = parsed.map((s: string) => ({ title: s, distance: '', image: '' }));
							} else {
								nearbyItems = parsed;
							}
						}
					} catch {
						nearbyItems = raw.split(',').map((s) => ({ title: s.trim(), distance: '', image: '' }));
					}
				}
			} else {
				nearbyItems = [{ title: '', distance: '', image: '' }];
			}
		});
	});
</script>

<div class="mx-auto max-w-4xl p-6 space-y-6">
	<svelte:boundary>
		{#await dataPromise}
			<div class="space-y-6">
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
			</div>
		{:then { property }}
			<!-- Room Form Sheet -->
			<RoomForm bind:open={roomSheetOpen} propertyId={property.id} room={selectedRoom} />

			<!-- Property Edit Form -->
			<Card>
				<CardHeader>
					<CardTitle>Edit Property</CardTitle>
					<CardDescription>Update property details.</CardDescription>
				</CardHeader>
				<form
					class="grid gap-4"
					{...updateProperty.enhance(async ({ submit }) => {
						try {
							await submit();
							toast.success('Property updated successfully');
						} catch (e: any) {
							toast.error(e.message || 'Failed to update');
						}
					})}
				>
					<CardContent class="grid gap-4">
						<input type="hidden" name="id" value={property.id} />
						<!-- Hidden Input for Amenities (Comma separated for schema transform) -->
						<input type="hidden" name="amenities" value={selectedAmenities.join(',')} />

						<div class="grid gap-2">
							<Label for="name">Property Name</Label>
							<Input id="name" name="name" required value={property.name} />
							{#if updateProperty.fields.name.issues()}
								<p class="text-destructive text-sm">
									{updateProperty.fields.name.issues()?.[0].message}
								</p>
							{/if}
						</div>

						<div class="grid gap-2">
							<Label for="description">Description</Label>
							<Textarea id="description" name="description" value={property.description} />
						</div>

						<div class="grid gap-2">
							<Label for="address">Address</Label>
							<Input id="address" name="address" required value={property.address} />
							{#if updateProperty.fields.address.issues()}
								<p class="text-destructive text-sm">
									{updateProperty.fields.address.issues()?.[0].message}
								</p>
							{/if}
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="grid gap-2">
								<Label for="lat">Latitude</Label>
								<Input id="lat" name="lat" type="number" step="any" value={property.lat} />
							</div>
							<div class="grid gap-2">
								<Label for="lng">Longitude</Label>
								<Input id="lng" name="lng" type="number" step="any" value={property.lng} />
							</div>
						</div>

						<div class="grid gap-2">
							<Label for="sector">Sector</Label>
							<Input id="sector" name="sector" value={property.sector} />
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="grid gap-2">
								<Label for="city">City</Label>
								<Input id="city" name="city" value={property.city} />
							</div>
							<div class="grid gap-2">
								<Label for="state">State</Label>
								<Input id="state" name="state" value={property.state} />
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="grid gap-2">
								<Label for="zip">Zip / Postal Code</Label>
								<Input id="zip" name="zip" value={property.zip} />
							</div>
							<div class="grid gap-2">
								<Label for="contactPhone">Contact Phone</Label>
								<Input id="contactPhone" name="contactPhone" value={property.contactPhone} />
							</div>
						</div>

						<div class="grid gap-2">
							<Label for="bookingCharge">Booking Charge</Label>
							<Input
								id="bookingCharge"
								name="bookingCharge"
								type="number"
								min="0"
								value={property.bookingCharge}
							/>
						</div>

						<div class="flex items-center gap-2">
							<input
								type="checkbox"
								id="isFoodServiceAvailable"
								name="isFoodServiceAvailable"
								class="w-4 h-4"
								checked={property.isFoodServiceAvailable}
							/>
							<Label for="isFoodServiceAvailable">Food Service Available</Label>
						</div>

						<div class="grid gap-2">
							<Label for="foodMenu">Food Menu URL</Label>
							<Input id="foodMenu" name="foodMenu" value={property.foodMenu} />
						</div>

						<div class="grid gap-2">
							<Label for="amenities">Amenities</Label>
							{#await amenitiesPromise}
								<div
									class="h-10 w-full rounded-md border border-input bg-muted animate-pulse flex items-center px-3 text-sm text-muted-foreground"
								>
									Loading amenities...
								</div>
							{:then amenitiesData}
								<Select.Root type="multiple" bind:value={selectedAmenities}>
									<Select.Trigger class="w-full">
										<div class="truncate text-left">
											{#if selectedAmenities.length > 0}
												{amenitiesData.amenities
													.filter((a) => selectedAmenities.includes(a.id))
													.map((a) => a.name)
													.join(', ')}
											{:else}
												<span class="text-muted-foreground">Select amenities</span>
											{/if}
										</div>
									</Select.Trigger>
									<Select.Content>
										{#each amenitiesData.amenities as amenity}
											<Select.Item value={amenity.id} label={amenity.name}>
												{amenity.name}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
								<p class="text-xs text-muted-foreground">Selected: {selectedAmenities.length}</p>
							{:catch}
								<p class="text-sm text-destructive">Failed to load amenities</p>
							{/await}
						</div>

						<div class="grid gap-2">
							<Label for="images">Images (URLs, comma separated)</Label>
							<Textarea
								id="images"
								name="images"
								value={property.media
									?.filter((m) => m.type === 'image')
									.map((m) => m.url)
									.join(', ') ?? ''}
							/>
						</div>

						<div class="grid gap-2">
							<Label>Nearby Places</Label>
							<input type="hidden" name="nearby" value={JSON.stringify(nearbyItems)} />
							<div class="space-y-2">
								{#each nearbyItems as item, i}
									<div class="flex gap-2 items-start">
										<div class="grid gap-1 flex-1">
											<Input bind:value={item.title} placeholder="Title (e.g. Metro)" />
										</div>
										<div class="grid gap-1 w-24">
											<Input bind:value={item.distance} placeholder="Dist" />
										</div>
										<div class="grid gap-1 flex-1">
											<Input bind:value={item.image} placeholder="Icon/Img URL" />
										</div>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											class="text-destructive"
											onclick={() => {
												if (nearbyItems.length > 1) {
													nearbyItems = nearbyItems.filter((_, idx) => idx !== i);
												} else {
													nearbyItems[0] = { title: '', distance: '', image: '' };
												}
											}}
										>
											<Trash class="h-4 w-4" />
										</Button>
									</div>
								{/each}
								<Button
									type="button"
									variant="outline"
									size="sm"
									onclick={() => {
										nearbyItems = [...nearbyItems, { title: '', distance: '', image: '' }];
									}}
								>
									<Plus class="mr-2 h-4 w-4" />
									Add Nearby Place
								</Button>
							</div>
						</div>
					</CardContent>
					<CardFooter class="justify-between">
						<div>
							<!-- Separate delete form? Or use button with click handler if remote func supports direct call? 
                                  Remote form helper is best used with form element.
                                  Nesting forms is invalid html. Need separate form for delete.
                             -->
							<!-- Using a form action strictly requires form element. 
                                  So I must put Delete button in its own form outside, or handle layout.
                                  Layout: Footer has space. I can put Delete form then Save button.
                             -->
						</div>

						<Button type="submit" disabled={!!updateProperty.pending}>
							{updateProperty.pending ? 'Saving...' : 'Save Changes'}
						</Button>
					</CardFooter>
				</form>

				<!-- Delete Form Positioned absolutely or flexed if needed, but here simple separate form in footer area -->
				<div class="px-6 pb-6">
					<form
						{...deleteProperty.enhance(async ({ submit }) => {
							if (!confirm('Are you sure you want to delete this property?')) return;
							try {
								await submit();
								toast.success('Property deleted');
								goto('/admin/properties');
							} catch (e: any) {
								toast.error(e.message || 'Failed to delete');
							}
						})}
					>
						<input type="hidden" name="id" value={property.id} />
						<Button variant="destructive" type="submit" disabled={!!deleteProperty.pending}>
							<Trash class="mr-2 h-4 w-4" />
							{deleteProperty.pending ? 'Deleting...' : 'Delete Property'}
						</Button>
					</form>
				</div>
			</Card>

			<!-- Rooms List -->
			<Card>
				<CardHeader class="flex flex-row items-center justify-between">
					<div>
						<CardTitle>Rooms</CardTitle>
						<CardDescription>Manage rooms for this property.</CardDescription>
					</div>
					<Button
						size="sm"
						onclick={() => {
							selectedRoom = null;
							roomSheetOpen = true;
						}}
					>
						<Plus class="mr-2 h-4 w-4" />
						Add Room
					</Button>
				</CardHeader>
				<CardContent>
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Number</Table.Head>
								<Table.Head>Type</Table.Head>
								<Table.Head>Monthly Price</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head class="text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each property.rooms as room}
								<Table.Row>
									<Table.Cell class="font-medium">{room.number}</Table.Cell>
									<Table.Cell class="capitalize">{room.type}</Table.Cell>
									<Table.Cell>{room.priceMonthly}</Table.Cell>
									<Table.Cell class="capitalize">{room.status}</Table.Cell>
									<Table.Cell class="text-right">
										<Button
											variant="ghost"
											size="sm"
											onclick={() => {
												selectedRoom = room;
												roomSheetOpen = true;
											}}
										>
											<Pencil class="h-4 w-4 mr-1" />
											Edit
										</Button>
									</Table.Cell>
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell colspan={5} class="h-24 text-center">No rooms added yet.</Table.Cell>
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
				<h3 class="font-semibold mb-2">Error loading property</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button variant="outline" href="/admin/properties">Go Back</Button>
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
