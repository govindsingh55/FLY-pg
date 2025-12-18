<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Sheet from '$lib/components/ui/sheet';
	import { createProperty } from '../properties.remote';
	import { getAmenities } from '../../amenities/amenities.remote';
	import { toast } from 'svelte-sonner';
	import * as Select from '$lib/components/ui/select';
	import { Trash, Plus } from 'lucide-svelte';
	import MediaSelection from '$lib/components/media/media-selection.svelte';

	let { open = $bindable(false) } = $props<{ open: boolean }>();

	let amenitiesPromise = $derived(
		open ? getAmenities({ pageSize: 1000 }) : Promise.resolve({ amenities: [] as any[], total: 0 })
	);
	let selectedAmenities = $state<string[]>([]);
	let selectedImages = $state<string[]>([]);
	let selectedStatus = $state('draft');
	let nearbyItems = $state([{ title: '', distance: '', image: '' }]);

	// Reset selection when dialog closes/opens
	$effect(() => {
		if (!open) {
			selectedAmenities = [];
			selectedImages = [];
			selectedStatus = 'draft';
			nearbyItems = [{ title: '', distance: '', image: '' }];
		}
	});

	const errors = $derived(
		createProperty.fields.allIssues()?.reduce((acc: Record<string, string>, issue: any) => {
			// Handle nested paths like address.city
			const path = issue.path.join('.');
			acc[path] = issue.message;
			return acc;
		}, {}) ?? {}
	);
</script>

<Sheet.Root bind:open>
	<Sheet.Content class="w-full lg:max-w-[50vw] overflow-y-auto p-4">
		<Sheet.Header>
			<Sheet.Title>Create Property</Sheet.Title>
			<Sheet.Description>Add a new property to your portfolio.</Sheet.Description>
		</Sheet.Header>
		<form
			class="grid gap-4 py-4"
			{...createProperty.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Property created successfully');
					open = false;
				} catch (e: any) {
					toast.error(e.message || 'Failed to create property');
				}
			})}
		>
			<!-- Hidden Input for Amenities (Comma separated for schema transform) -->
			<input type="hidden" name="amenities" value={selectedAmenities.join(',')} />

			<MediaSelection
				value={selectedImages}
				onValueChange={(urls) => (selectedImages = urls as string[])}
				mode="multiple"
				label="Property Images"
				name="images"
			/>

			<div class="grid gap-2">
				<Label for="name">Property Name</Label>
				<Input id="name" name="name" placeholder="e.g. Sunrise Apartments" required />
				{#if errors.name}
					<p class="text-destructive text-sm">{errors.name}</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="description">Description</Label>
				<Textarea id="description" name="description" placeholder="A brief description..." />
			</div>

			<div class="grid gap-2">
				<Label for="address">Address (Street)</Label>
				<Input id="address" name="address" placeholder="123 Main St" required />
				{#if errors.address}
					<p class="text-destructive text-sm">{errors.address}</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="lat">Latitude</Label>
					<Input id="lat" name="lat" type="number" step="any" placeholder="12.34" />
				</div>
				<div class="grid gap-2">
					<Label for="lng">Longitude</Label>
					<Input id="lng" name="lng" type="number" step="any" placeholder="56.78" />
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="sector">Sector</Label>
				<Input id="sector" name="sector" placeholder="Sector 15" />
				{#if errors.sector}
					<p class="text-destructive text-sm">{errors.sector}</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="city">City</Label>
					<Input id="city" name="city" placeholder="New York" required />
					{#if errors.city}
						<p class="text-destructive text-sm">{errors.city}</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="state">State</Label>
					<Input id="state" name="state" placeholder="NY" required />
					{#if errors.state}
						<p class="text-destructive text-sm">{errors.state}</p>
					{/if}
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="zip">Zip / Postal Code</Label>
					<Input id="zip" name="zip" placeholder="10001" required />
					{#if errors.zip}
						<p class="text-destructive text-sm">{errors.zip}</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="contactPhone">Contact Phone</Label>
					<Input id="contactPhone" name="contactPhone" placeholder="+1234567890" />
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="bookingCharge">Booking Charge</Label>
				<Input id="bookingCharge" name="bookingCharge" type="number" min="0" placeholder="0" />
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
				/>
				<Label for="isFoodServiceAvailable">Food Service Available</Label>
			</div>

			<div class="grid gap-2">
				<Label for="foodMenu">Food Menu URL</Label>
				<Input id="foodMenu" name="foodMenu" placeholder="https://example.com/menu.pdf" />
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

			<Sheet.Footer>
				<Button type="submit" disabled={!!createProperty.pending}>
					{createProperty.pending ? 'Creating...' : 'Create Property'}
				</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
