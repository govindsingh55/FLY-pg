<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Sheet from '$lib/components/ui/sheet';
	import { createProperty } from '../properties.remote';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false) } = $props<{ open: boolean }>();

	const errors = $derived(
		createProperty.fields.allIssues()?.reduce((acc: Record<string, string>, issue: any) => {
			acc[issue.path[0]] = issue.message;
			return acc;
		}, {}) ?? {}
	);
</script>

<Sheet.Root bind:open>
	<Sheet.Content class="sm:max-w-[500px] overflow-y-auto">
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
			<div class="grid gap-2">
				<Label for="name">Property Name</Label>
				<Input id="name" name="name" placeholder="e.g. Sunrise Apartments" required />
				{#if errors.name}
					<p class="text-destructive text-sm">{errors.name}</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="address">Address</Label>
				<Input id="address" name="address" placeholder="123 Main St" required />
				{#if errors.address}
					<p class="text-destructive text-sm">{errors.address}</p>
				{/if}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="city">City</Label>
					<Input id="city" name="city" placeholder="New York" />
				</div>
				<div class="grid gap-2">
					<Label for="state">State</Label>
					<Input id="state" name="state" placeholder="NY" />
				</div>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="zip">Zip / Postal Code</Label>
					<Input id="zip" name="zip" placeholder="10001" />
				</div>
				<div class="grid gap-2">
					<Label for="contactPhone">Contact Phone</Label>
					<Input id="contactPhone" name="contactPhone" placeholder="+1234567890" />
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="description">Description</Label>
				<Input id="description" name="description" placeholder="A brief description..." />
			</div>

			<Sheet.Footer>
				<Button type="submit" disabled={!!createProperty.pending}>
					{createProperty.pending ? 'Creating...' : 'Create Property'}
				</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
