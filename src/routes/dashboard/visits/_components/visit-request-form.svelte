<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Sheet from '$lib/components/ui/sheet';
	import { MediaQuery } from 'svelte/reactivity';
	import { toast } from 'svelte-sonner';
	import { requestVisit } from '../visits.remote';

	let { open = $bindable(false), properties = [] } = $props<{
		open: boolean;
		properties: any[];
	}>();

	const isDesktop = new MediaQuery('(min-width: 768px)');
</script>

{#snippet visitFormFields(errors: any = {})}
	<div class="grid gap-2">
		<Label for="propertyId">Property</Label>
		<select
			id="propertyId"
			name="propertyId"
			required
			class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
			class:border-destructive={errors?.propertyId}
		>
			<option value="">Select Property...</option>
			{#each properties as p}
				<option value={p.id}>{p.name}</option>
			{/each}
		</select>
		{#if errors?.propertyId}
			<p class="text-sm text-destructive">{errors.propertyId}</p>
		{/if}
	</div>
	<div class="grid grid-cols-2 gap-4">
		<div class="grid gap-2">
			<Label for="visitDate">Date</Label>
			<Input
				id="visitDate"
				type="date"
				name="visitDate"
				required
				min={new Date().toISOString().split('T')[0]}
				class={errors?.visitDate ? 'border-destructive' : ''}
			/>
			{#if errors?.visitDate}
				<p class="text-sm text-destructive">{errors.visitDate}</p>
			{/if}
		</div>
		<div class="grid gap-2">
			<Label for="visitTime">Time</Label>
			<Input
				id="visitTime"
				type="time"
				name="visitTime"
				required
				class={errors?.visitTime ? 'border-destructive' : ''}
			/>
			{#if errors?.visitTime}
				<p class="text-sm text-destructive">{errors.visitTime}</p>
			{/if}
		</div>
	</div>
{/snippet}

<svelte:boundary>
	{#if isDesktop.current}
		<Sheet.Root bind:open>
			<Sheet.Content>
				<Sheet.Header>
					<Sheet.Title>Schedule a Property Visit</Sheet.Title>
					<Sheet.Description>Pick a date and time to visit a property.</Sheet.Description>
				</Sheet.Header>
				<form
					class="space-y-4 p-4"
					{...requestVisit.enhance(async ({ submit }) => {
						try {
							await submit();
							toast.success('Visit requested successfully!');
							open = false;
						} catch (error: any) {
							toast.error(error?.message || 'Failed to request visit');
						}
					})}
				>
					{@render visitFormFields(
						requestVisit.fields.allIssues()?.reduce((acc: any, issue: any) => {
							acc[issue.path[0]] = issue.message;
							return acc;
						}, {})
					)}
					<Sheet.Footer>
						<Button type="submit">Request Visit</Button>
					</Sheet.Footer>
				</form>
			</Sheet.Content>
		</Sheet.Root>
	{:else}
		<Drawer.Root bind:open>
			<Drawer.Content>
				<Drawer.Header class="text-left">
					<Drawer.Title>Schedule a Property Visit</Drawer.Title>
					<Drawer.Description>Pick a date and time to visit a property.</Drawer.Description>
				</Drawer.Header>
				<form
					class="space-y-4 px-4"
					{...requestVisit.enhance(async ({ submit }) => {
						try {
							await submit();
							toast.success('Visit requested successfully!');
							open = false;
						} catch (error: any) {
							toast.error(error?.message || 'Failed to request visit');
						}
					})}
				>
					{@render visitFormFields(
						requestVisit.fields.allIssues()?.reduce((acc: any, issue: any) => {
							acc[issue.path[0]] = issue.message;
							return acc;
						}, {})
					)}
					<Drawer.Footer class="pt-2">
						<Button type="submit">Request Visit</Button>
						<Drawer.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Drawer.Close>
					</Drawer.Footer>
				</form>
			</Drawer.Content>
		</Drawer.Root>
	{/if}

	{#snippet failed(error: any, reset)}
		<div class="hidden">
			<!-- Form failed silently to avoid breaking UI layout since it's a modal -->
			{console.error('Visit form error:', error)}
		</div>
	{/snippet}
</svelte:boundary>
