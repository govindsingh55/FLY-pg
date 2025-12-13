<script lang="ts">
	import { enhance } from '$app/forms';
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
	import { Plus, Trash } from 'lucide-svelte';

	let { data, form } = $props();
</script>

<div class="mx-auto max-w-4xl p-6 space-y-6">
	<!-- Property Edit Form -->
	<Card>
		<CardHeader>
			<CardTitle>Edit Property</CardTitle>
			<CardDescription>Update property details.</CardDescription>
		</CardHeader>
		<form method="POST" action="?/update" use:enhance>
			<CardContent class="grid gap-4">
				<div class="grid gap-2">
					<Label for="name">Property Name</Label>
					<Input id="name" name="name" required value={data.property.name} />
				</div>

				<div class="grid gap-2">
					<Label for="address">Address</Label>
					<Input id="address" name="address" required value={data.property.address} />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="city">City</Label>
						<Input id="city" name="city" value={data.property.city} />
					</div>
					<div class="grid gap-2">
						<Label for="state">State</Label>
						<Input id="state" name="state" value={data.property.state} />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="zip">Zip / Postal Code</Label>
						<Input id="zip" name="zip" value={data.property.zip} />
					</div>
					<div class="grid gap-2">
						<Label for="contactPhone">Contact Phone</Label>
						<Input id="contactPhone" name="contactPhone" value={data.property.contactPhone} />
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="description">Description</Label>
					<Input id="description" name="description" value={data.property.description} />
				</div>
			</CardContent>
			<CardFooter class="justify-between">
				<form
					method="POST"
					action="?/delete"
					use:enhance
					onsubmit={(e) => !confirm('Are you sure?') && e.preventDefault()}
				>
					<Button variant="destructive" type="submit">
						<Trash class="mr-2 h-4 w-4" />
						Delete Property
					</Button>
				</form>
				<Button type="submit">Save Changes</Button>
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
			<Button size="sm" href="/admin/properties/{data.property.id}/rooms/create">
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
					{#each data.property.rooms as room}
						<Table.Row>
							<Table.Cell class="font-medium">{room.number}</Table.Cell>
							<Table.Cell class="capitalize">{room.type}</Table.Cell>
							<Table.Cell>{room.priceMonthly}</Table.Cell>
							<Table.Cell class="capitalize">{room.status}</Table.Cell>
							<Table.Cell class="text-right">
								<Button variant="ghost" size="sm" href="/admin/rooms/{room.id}">Edit</Button>
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
</div>
