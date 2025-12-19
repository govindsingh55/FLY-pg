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
	import { ArrowLeft, Trash } from 'lucide-svelte';
	import { page } from '$app/stores';
	import { getCustomer, updateCustomer, deleteCustomer } from '../customers.remote';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';

	let id = $derived($page.params.id);
	let dataPromise = $derived(getCustomer(id as string));
</script>

<div class="mx-auto max-w-4xl p-6 space-y-6">
	<!-- back button -->
	<Button variant="outline" onclick={() => goto('/admin/customers')}>
		<ArrowLeft class="size-4" />
		Back
	</Button>
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
		{:then { customer }}
			<!-- Customer Edit Form -->
			<Card>
				<CardHeader>
					<CardTitle>Edit Customer</CardTitle>
					<CardDescription>Update customer profile.</CardDescription>
				</CardHeader>
				<form
					{...updateCustomer.enhance(async ({ submit }) => {
						try {
							await submit();
							toast.success('Customer updated successfully');
						} catch (e: any) {
							toast.error(e.message || 'Failed to update');
						}
					})}
				>
					<CardContent class="grid gap-4">
						<input type="hidden" name="id" value={customer.id} />
						<div class="grid gap-2">
							<Label for="name">Full Name</Label>
							<Input id="name" name="name" required value={customer.name} />
							{#if updateCustomer.fields.name.issues()}
								<p class="text-destructive text-sm">
									{updateCustomer.fields.name.issues()?.join(' ')}
								</p>
							{/if}
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="grid gap-2">
								<Label for="email">Email</Label>
								<Input type="email" id="email" name="email" required value={customer.email} />
							</div>
							<div class="grid gap-2">
								<Label for="phone">Phone</Label>
								<Input id="phone" name="phone" required value={customer.phone} />
							</div>
						</div>

						<div class="grid gap-2">
							<Label for="addressPermanent">Permanent Address</Label>
							<Input
								id="addressPermanent"
								name="addressPermanent"
								value={customer.addressPermanent}
							/>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="grid gap-2">
								<Label for="idProofType">ID Proof Type</Label>
								<Input id="idProofType" name="idProofType" value={customer.idProofType} />
							</div>
							<div class="grid gap-2">
								<Label for="idProofNumber">ID Proof Number</Label>
								<Input id="idProofNumber" name="idProofNumber" value={customer.idProofNumber} />
							</div>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="grid gap-2">
								<Label for="emergencyContactName">Emergency Contact Name</Label>
								<Input
									id="emergencyContactName"
									name="emergencyContactName"
									value={customer.emergencyContactName}
								/>
							</div>
							<div class="grid gap-2">
								<Label for="emergencyContactPhone">Emergency Contact Phone</Label>
								<Input
									id="emergencyContactPhone"
									name="emergencyContactPhone"
									value={customer.emergencyContactPhone}
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
								<option value="active" selected={customer.status === 'active'}>Active</option>
								<option value="inactive" selected={customer.status === 'inactive'}>Inactive</option>
							</select>
						</div>

						{#if customer.user}
							<div class="grid gap-2">
								<Label>Linked Account</Label>
								<p class="text-sm text-muted-foreground">
									User ID: {customer.userId} (Email: {customer.user.email})
								</p>
							</div>
						{/if}
					</CardContent>
					<CardFooter class="justify-between">
						<div>
							<!-- Placeholder to spacing -->
						</div>
						<Button type="submit" disabled={!!updateCustomer.pending}>
							{updateCustomer.pending ? 'Saving...' : 'Save Changes'}
						</Button>
					</CardFooter>
				</form>

				<div class="px-6 pb-6">
					<form
						{...deleteCustomer.enhance(async ({ submit }) => {
							if (!confirm('Are you sure?')) return;
							try {
								await submit();
								toast.success('Customer deleted');
								goto('/admin/customers');
							} catch (e: any) {
								toast.error(e.message || 'Failed to delete');
							}
						})}
					>
						<input type="hidden" name="id" value={customer.id} />
						<Button variant="destructive" type="submit" disabled={!!deleteCustomer.pending}>
							<Trash class="mr-2 h-4 w-4" />
							{deleteCustomer.pending ? 'Deleting...' : 'Delete Customer'}
						</Button>
					</form>
				</div>
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
							{#each customer.bookings as booking}
								<Table.Row>
									<Table.Cell>
										{booking.contract?.startDate
											? new Date(booking.contract.startDate).toLocaleDateString()
											: 'N/A'}
									</Table.Cell>
									<Table.Cell>
										{booking.property ? booking.property.name : booking.propertyId} /
										{booking.room ? `Room ${booking.room.number}` : booking.roomId}
									</Table.Cell>
									<Table.Cell>{booking.contract?.rentAmount ?? 'N/A'}</Table.Cell>
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
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading customer</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button variant="outline" href="/admin/customers">Go Back</Button>
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
