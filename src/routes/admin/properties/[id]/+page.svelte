<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import RichTextEditor from '$lib/components/editor/rich-text-editor.svelte';
	import MediaSelection from '$lib/components/media/media-selection.svelte';
	import * as AlertDialog from '$lib/components/ui/alert-dialog';
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import { Plus, Trash, Pencil, ChevronLeft } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { getAmenities } from '../../amenities/amenities.remote';
	import RoomForm from '../_components/room-form.svelte';
	import { deleteProperty, getProperty, updateProperty } from '../properties.remote';

	let id = $derived(page.params.id);
	let dataPromise = $derived(getProperty(id as string));
	let amenitiesPromise = $derived(getAmenities({ pageSize: 1000 }));

	let roomSheetOpen = $state(false);
	let selectedRoom = $state<any>(null); // Using any or specific type if available
	let selectedAmenities = $state<string[]>([]);
	let selectedImages = $state<string[]>([]);
	let selectedStatus = $state('draft');
	let nearbyItems = $state<any[]>([{ title: '', distance: '', image: '' }]);
	let descriptionValue = $state('');

	$effect(() => {
		dataPromise.then((data) => {
			if (data.property?.description) {
				descriptionValue = data.property.description || '';
			}
			if (data.property?.amenities) {
				selectedAmenities = data.property.amenities.map((a: any) => a.amenityId);
			}
			if (data.property?.status) {
				selectedStatus = data.property.status;
			}
			if (data.property?.media) {
				selectedImages = data.property.media
					.filter((m: any) => m.type === 'image')
					.map((m: any) => m.url);
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

{#if updateProperty.fields.issues()}
	<ul>
		{#each updateProperty.fields.issues() as issue}
			<li>{issue.message}</li>
		{/each}
	</ul>
{/if}

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
			<div class="flex items-center justify-between mb-6">
				<div class="flex items-center gap-4">
					<Button variant="outline" size="icon" href="/admin/properties">
						<ChevronLeft class="h-4 w-4" />
					</Button>
					<h1 class="text-3xl font-bold tracking-tight">Edit Property</h1>
				</div>
				<AlertDialog.Root>
					<AlertDialog.Trigger>
						{#snippet child({ props })}
							<Button {...props} variant="destructive">
								<Trash class="mr-2 h-4 w-4" />
								Delete Property
							</Button>
						{/snippet}
					</AlertDialog.Trigger>
					<AlertDialog.Content>
						<AlertDialog.Header>
							<AlertDialog.Title>Are you sure?</AlertDialog.Title>
							<AlertDialog.Description>
								This action cannot be undone. This will permanently delete the property and all its
								associated rooms, media, and data.
							</AlertDialog.Description>
						</AlertDialog.Header>
						<AlertDialog.Footer>
							<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
							<form
								{...deleteProperty.enhance(async ({ submit }) => {
									try {
										await submit();
										toast.success('Property deleted');
										goto('/admin/properties');
									} catch (e: any) {
										toast.error(e.message || 'Failed to delete');
										console.error(e);
									}
								})}
							>
								<input type="hidden" name="id" value={property.id} />
								<AlertDialog.Action
									type="submit"
									class={buttonVariants({ variant: 'destructive' })}
								>
									Delete Property
								</AlertDialog.Action>
							</form>
						</AlertDialog.Footer>
					</AlertDialog.Content>
				</AlertDialog.Root>
			</div>

			<!-- Room Form Sheet -->
			<RoomForm bind:open={roomSheetOpen} propertyId={property.id} room={selectedRoom} />

			<!-- Property Edit Form -->
			<Card>
				<CardHeader>
					<CardTitle>Property Details</CardTitle>
					<CardDescription>Update property details.</CardDescription>
				</CardHeader>
				<form
					class="grid gap-4"
					{...updateProperty.enhance(async ({ submit }) => {
						try {
							console.log('Submitting update...');
							await submit();
							console.log(
								'Submitted update...',
								updateProperty.fields.allIssues(),
								updateProperty.result
							);
							toast.success('Property updated successfully');
						} catch (e: any) {
							console.error(e);
							toast.error(e.message || 'Failed to update');
						}
					})}
				>
					<CardContent class="grid gap-4">
						<input type="hidden" name="id" value={property.id} />
						<!-- Hidden Input for Amenities (Comma separated for schema transform) -->
						<input type="hidden" name="amenities" value={selectedAmenities.join(',')} />

						<MediaSelection
							value={selectedImages}
							onValueChange={(urls) => (selectedImages = urls as string[])}
							mode="multiple"
							label="Property Images"
							name=""
						/>
						<!-- Send media as comma-separated URLs (schema will split and map to IDs) -->
						<input type="hidden" name="media" value={selectedImages.join(',')} />

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
							<RichTextEditor
								bind:value={descriptionValue}
								placeholder="Enter property description with rich formatting..."
								maxLength={5000}
							/>
							<input type="hidden" name="description" value={descriptionValue} />
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

						<div class="grid gap-2">
							<Label for="status">Status</Label>
							<Select.Root
								type="single"
								value={selectedStatus}
								onValueChange={(v) => (selectedStatus = v)}
							>
								<Select.Trigger class="w-full capitalize">
									{selectedStatus || 'Select status'}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="draft" label="Draft">Draft</Select.Item>
									<Select.Item value="published" label="Published">Published</Select.Item>
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="status" value={selectedStatus} />
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

						<Button {...updateProperty.buttonProps}>
							{updateProperty.pending ? 'Saving...' : 'Save Changes'}
						</Button>
					</CardFooter>
				</form>
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
