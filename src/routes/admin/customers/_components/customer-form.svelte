<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Sheet from '$lib/components/ui/sheet';
	import { createCustomer } from '../customers.remote';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false) } = $props<{ open: boolean }>();

	const errors = $derived(
		createCustomer.fields.allIssues()?.reduce((acc: Record<string, string>, issue: any) => {
			acc[issue.path[0]] = issue.message;
			return acc;
		}, {}) ?? {}
	);
</script>

<Sheet.Root bind:open>
	<Sheet.Content class="sm:max-w-[500px] overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title>Add Customer</Sheet.Title>
			<Sheet.Description>Register a new tenant/customer.</Sheet.Description>
		</Sheet.Header>
		<form
			class="grid gap-4 py-4"
			{...createCustomer.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Customer created successfully');
					open = false;
				} catch (e: any) {
					toast.error(e.message || 'Failed to create customer');
				}
			})}
		>
			<div class="grid gap-2">
				<Label for="name">Full Name</Label>
				<Input id="name" name="name" placeholder="John Doe" required />
				{#if errors.name}
					<p class="text-destructive text-sm">{errors.name}</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="email">Email</Label>
					<Input type="email" id="email" name="email" placeholder="john@example.com" required />
					{#if errors.email}
						<p class="text-destructive text-sm">{errors.email}</p>
					{/if}
				</div>
				<div class="grid gap-2">
					<Label for="phone">Phone</Label>
					<Input id="phone" name="phone" placeholder="+1234567890" required />
					{#if errors.phone}
						<p class="text-destructive text-sm">{errors.phone}</p>
					{/if}
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="addressPermanent">Permanent Address</Label>
				<Input id="addressPermanent" name="addressPermanent" />
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="idProofType">ID Proof Type</Label>
					<Input id="idProofType" name="idProofType" placeholder="Passport / Drivers License" />
				</div>
				<div class="grid gap-2">
					<Label for="idProofNumber">ID Proof Number</Label>
					<Input id="idProofNumber" name="idProofNumber" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="emergencyContactName">Emergency Contact Name</Label>
					<Input id="emergencyContactName" name="emergencyContactName" />
				</div>
				<div class="grid gap-2">
					<Label for="emergencyContactPhone">Emergency Contact Phone</Label>
					<Input id="emergencyContactPhone" name="emergencyContactPhone" />
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="status">Status</Label>
				<select
					name="status"
					id="status"
					class="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="active" selected>Active</option>
					<option value="inactive">Inactive</option>
				</select>
			</div>

			<Sheet.Footer>
				<Button type="submit" disabled={!!createCustomer.pending}>
					{createCustomer.pending ? 'Saving...' : 'Save Customer'}
				</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
