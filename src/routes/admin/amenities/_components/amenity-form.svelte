<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Sheet from '$lib/components/ui/sheet';
	import { createAmenity, updateAmenity } from '../amenities.remote';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false), amenity = null } = $props<{
		open: boolean;
		amenity?: {
			id: string;
			name: string;
			description: string | null;
			image: string | null;
			icon: string | null;
		} | null;
	}>();

	const isEditing = $derived(!!amenity);
	const remoteAction = $derived(isEditing ? updateAmenity : createAmenity);

	const errors = $derived(
		remoteAction.fields.allIssues()?.reduce((acc: Record<string, string>, issue: any) => {
			acc[issue.path.join('.')] = issue.message;
			return acc;
		}, {}) ?? {}
	);
</script>

<Sheet.Root bind:open>
	<Sheet.Content class="w-full lg:max-w-[400px] overflow-y-auto p-4">
		<Sheet.Header>
			<Sheet.Title>{isEditing ? 'Edit Amenity' : 'Add Amenity'}</Sheet.Title>
			<Sheet.Description>
				{isEditing
					? 'Update the details for this amenity.'
					: 'Create a new amenity for properties.'}
			</Sheet.Description>
		</Sheet.Header>
		<form
			class="grid gap-4 py-4"
			{...remoteAction.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success(`Amenity ${isEditing ? 'updated' : 'created'} successfully`);
					open = false;
				} catch (e: any) {
					toast.error(e.message || `Failed to ${isEditing ? 'update' : 'create'} amenity`);
				}
			})}
		>
			{#if isEditing}
				<input type="hidden" name="id" value={amenity?.id} />
			{/if}

			<div class="grid gap-2">
				<Label for="name">Name</Label>
				<Input
					id="name"
					name="name"
					placeholder="e.g. WiFi, Gym, Pool"
					value={amenity?.name}
					required
				/>
				{#if errors.name}
					<p class="text-destructive text-sm">{errors.name}</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="description">Description</Label>
				<Textarea
					id="description"
					name="description"
					placeholder="A brief description of the amenity..."
					value={amenity?.description ?? ''}
				/>
				{#if errors.description}
					<p class="text-destructive text-sm">{errors.description}</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="icon">Icon Name (Lucide)</Label>
				<Input
					id="icon"
					name="icon"
					placeholder="e.g. wifi, dumbbell, waves"
					value={amenity?.icon ?? ''}
				/>
				<p class="text-[10px] text-muted-foreground">
					Use a valid Lucide icon name (lowercase, no spaces).
				</p>
				{#if errors.icon}
					<p class="text-destructive text-sm">{errors.icon}</p>
				{/if}
			</div>

			<div class="grid gap-2">
				<Label for="image">Image URL (Optional)</Label>
				<Input id="image" name="image" placeholder="https://..." value={amenity?.image ?? ''} />
				{#if errors.image}
					<p class="text-destructive text-sm">{errors.image}</p>
				{/if}
			</div>

			<Sheet.Footer>
				<Button type="submit" disabled={!!remoteAction.pending}>
					{remoteAction.pending ? 'Saving...' : isEditing ? 'Update Amenity' : 'Create Amenity'}
				</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
