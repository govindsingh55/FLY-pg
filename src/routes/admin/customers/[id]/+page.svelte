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
	import { Trash } from 'lucide-svelte';
	// Tabs would be good here, but let's stick to vertical layout for simplicity first.

	let { data, form } = $props();
</script>

<div class="mx-auto max-w-4xl p-6 space-y-6">
	<!-- Customer Edit Form -->
	<Card>
		<CardHeader>
			<CardTitle>Edit Customer</CardTitle>
			<CardDescription>Update customer profile.</CardDescription>
		</CardHeader>
		<form method="POST" action="?/update" use:enhance>
			<CardContent class="grid gap-4">
				<div class="grid gap-2">
					<Label for="name">Full Name</Label>
					<Input id="name" name="name" required value={data.customer.name} />
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input type="email" id="email" name="email" required value={data.customer.email} />
					</div>
					<div class="grid gap-2">
						<Label for="phone">Phone</Label>
						<Input id="phone" name="phone" required value={data.customer.phone} />
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="addressPermanent">Permanent Address</Label>
					<Input
						id="addressPermanent"
						name="addressPermanent"
						value={data.customer.addressPermanent}
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="idProofType">ID Proof Type</Label>
						<Input id="idProofType" name="idProofType" value={data.customer.idProofType} />
					</div>
					<div class="grid gap-2">
						<Label for="idProofNumber">ID Proof Number</Label>
						<Input id="idProofNumber" name="idProofNumber" value={data.customer.idProofNumber} />
					</div>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div class="grid gap-2">
						<Label for="emergencyContactName">Emergency Contact Name</Label>
						<Input
							id="emergencyContactName"
							name="emergencyContactName"
							value={data.customer.emergencyContactName}
						/>
					</div>
					<div class="grid gap-2">
						<Label for="emergencyContactPhone">Emergency Contact Phone</Label>
						<Input
							id="emergencyContactPhone"
							name="emergencyContactPhone"
							value={data.customer.emergencyContactPhone}
						/>
					</div>
				</div>

				<div class="grid gap-2">
					<Label for="status">Status</Label>
					<select
						name="status"
						id="status"
						class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="active" selected={data.customer.status === 'active'}>Active</option>
						<option value="inactive" selected={data.customer.status === 'inactive'}>Inactive</option
						>
					</select>
				</div>

				{#if data.customer.user}
					<div class="grid gap-2">
						<Label>Linked Account</Label>
						<p class="text-sm text-muted-foreground">
							User ID: {data.customer.userId} (Email: {data.customer.user.email})
						</p>
					</div>
				{/if}
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
						Delete Customer
					</Button>
				</form>
				<Button type="submit">Save Changes</Button>
			</CardFooter>
		</form>
	</Card>

	<!-- Bookings History -->
	<Card>
		<CardHeader>
			<CardTitle>Bookings History</CardTitle>
		</CardHeader>
		<CardContent>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Date</Table.Head>
						<Table.Head>Prop/Room</Table.Head>
						<Table.Head>Rent</Table.Head>
						<Table.Head>Status</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.customer.bookings as booking}
						<Table.Row>
							<Table.Cell>{new Date(booking.startDate).toLocaleDateString()}</Table.Cell>
							<Table.Cell>{booking.propertyId} / {booking.roomId}</Table.Cell>
							<Table.Cell>{booking.rentAmount}</Table.Cell>
							<Table.Cell class="capitalize">{booking.status}</Table.Cell>
						</Table.Row>
					{:else}
						<Table.Row>
							<Table.Cell colspan={4} class="h-24 text-center">No bookings found.</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</CardContent>
	</Card>
</div>
