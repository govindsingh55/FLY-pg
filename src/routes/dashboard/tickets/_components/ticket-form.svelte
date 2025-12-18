<script lang="ts">
	import { Button, buttonVariants } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Drawer from '$lib/components/ui/drawer';
	import * as Sheet from '$lib/components/ui/sheet';
	import { MediaQuery } from 'svelte/reactivity';
	import { toast } from 'svelte-sonner';
	import { createTicket } from '../tickets.remote';

	let { open = $bindable(false) } = $props<{
		open: boolean;
	}>();

	const isDesktop = new MediaQuery('(min-width: 768px)');
</script>

{#snippet ticketFormFields(errors: any = {})}
	<div class="grid gap-4 py-4">
		<div class="grid gap-2">
			<Label for="subject">Subject</Label>
			<Input
				id="subject"
				name="subject"
				placeholder="e.g. Leaking Tap"
				required
				class={errors?.subject ? 'border-destructive' : ''}
			/>
			{#if errors?.subject}
				<p class="text-sm text-destructive">{errors.subject}</p>
			{/if}
		</div>

		<div class="grid grid-cols-2 gap-4">
			<div class="grid gap-2">
				<Label for="type">Issue Type</Label>
				<select
					name="type"
					id="type"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					class:border-destructive={errors?.type}
				>
					<option value="electricity">Electricity</option>
					<option value="plumbing">Plumbing</option>
					<option value="furniture">Furniture</option>
					<option value="wifi">Wifi</option>
					<option value="other">Other</option>
				</select>
				{#if errors?.type}
					<p class="text-sm text-destructive">{errors.type}</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="priority">Priority</Label>
				<select
					name="priority"
					id="priority"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					class:border-destructive={errors?.priority}
				>
					<option value="low">Low</option>
					<option value="medium" selected>Medium</option>
					<option value="high">High</option>
				</select>
				{#if errors?.priority}
					<p class="text-sm text-destructive">{errors.priority}</p>
				{/if}
			</div>
		</div>

		<div class="grid gap-2">
			<Label for="description">Description</Label>
			<Textarea
				id="description"
				name="description"
				placeholder="Please describe the issue in detail..."
				required
				class={errors?.description ? 'border-destructive' : ''}
			/>
			{#if errors?.description}
				<p class="text-sm text-destructive">{errors.description}</p>
			{/if}
		</div>
	</div>
{/snippet}

<svelte:boundary>
	{#if isDesktop.current}
		<Sheet.Root bind:open>
			<Sheet.Content>
				<Sheet.Header>
					<Sheet.Title>Raise a Ticket</Sheet.Title>
					<Sheet.Description>Report an issue with your room or property.</Sheet.Description>
				</Sheet.Header>
				<form
					{...createTicket.enhance(async ({ submit }) => {
						try {
							await submit();
							toast.success('Ticket created successfully!');
							open = false;
						} catch (error: any) {
							toast.error(error?.message || 'Failed to create ticket');
						}
					})}
				>
					{@render ticketFormFields(
						createTicket.fields.allIssues()?.reduce((acc: any, issue: any) => {
							acc[issue.path[0]] = issue.message;
							return acc;
						}, {})
					)}
					<Sheet.Footer>
						<Button type="submit" disabled={!!createTicket.pending}>
							{createTicket.pending ? 'Creating...' : 'Submit Ticket'}
						</Button>
					</Sheet.Footer>
				</form>
			</Sheet.Content>
		</Sheet.Root>
	{:else}
		<Drawer.Root bind:open>
			<Drawer.Content>
				<Drawer.Header class="text-left">
					<Drawer.Title>Raise a Ticket</Drawer.Title>
					<Drawer.Description>Report an issue with your room or property.</Drawer.Description>
				</Drawer.Header>
				<form
					class="px-4"
					{...createTicket.enhance(async ({ submit }) => {
						try {
							await submit();
							toast.success('Ticket created successfully!');
							open = false;
						} catch (error: any) {
							toast.error(error?.message || 'Failed to create ticket');
						}
					})}
				>
					{@render ticketFormFields(
						createTicket.fields.allIssues()?.reduce((acc: any, issue: any) => {
							acc[issue.path[0]] = issue.message;
							return acc;
						}, {})
					)}
					<Drawer.Footer class="pt-2 pb-4">
						<Button type="submit" disabled={!!createTicket.pending}>
							{createTicket.pending ? 'Creating...' : 'Submit Ticket'}
						</Button>
						<Drawer.Close class={buttonVariants({ variant: 'outline' })}>Cancel</Drawer.Close>
					</Drawer.Footer>
				</form>
			</Drawer.Content>
		</Drawer.Root>
	{/if}

	{#snippet failed(error: any, reset)}
		<div class="hidden">
			{console.error('Ticket form error:', error)}
		</div>
	{/snippet}
</svelte:boundary>
