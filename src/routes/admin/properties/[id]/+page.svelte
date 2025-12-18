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
	import * as Table from '$lib/components/ui/table';
	import { Plus, Trash, Pencil } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { getProperty, updateProperty, deleteProperty } from '../properties.remote';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import RoomForm from '../_components/room-form.svelte';

	let id = $derived($page.params.id);
	let dataPromise = $derived(getProperty(id as string));

	let roomSheetOpen = $state(false);
	let selectedRoom = $state<any>(null); // Using any or specific type if available
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
							<Label for="description">Description</Label>
							<Input id="description" name="description" value={property.description} />
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
