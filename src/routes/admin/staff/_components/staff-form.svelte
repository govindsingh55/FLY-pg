<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { createStaff } from '../staff.remote';
	import { toast } from 'svelte-sonner';

	let { open = $bindable(false) } = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Add New Staff Member</Dialog.Title>
		</Dialog.Header>
		<form
			class="space-y-4"
			{...createStaff.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Staff created successfully');
					open = false;
				} catch (e: any) {
					toast.error(e.message || 'Failed to create staff');
				}
			})}
		>
			<div class="grid gap-2">
				<Label for="name">Name</Label>
				<Input id="name" name="name" required />
				{#if createStaff.fields.name.issues.length > 0}
					<p class="text-sm text-destructive">
						{createStaff.fields.name
							.issues()
							?.map((m) => m.message)
							.join(', ')}
					</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="email">Email</Label>
				<Input id="email" name="email" type="email" required />
				{#if createStaff.fields.email.issues.length > 0}
					<p class="text-sm text-destructive">
						{createStaff.fields.email
							.issues()
							?.map((m) => m.message)
							.join(', ')}
					</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="password">Password</Label>
				<Input id="password" name="password" type="password" required minlength={6} />
				{#if createStaff.fields.password.issues?.length > 0}
					<p class="text-sm text-destructive">
						{createStaff.fields.password
							.issues()
							?.map((m) => m.message)
							.join(', ')}
					</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="staffType">Role Type</Label>
				<select
					id="staffType"
					name="staffType"
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					<option value="chef">Chef</option>
					<option value="janitor">Janitor</option>
					<option value="security">Security</option>
				</select>
			</div>
			<Dialog.Footer>
				<Button type="submit" disabled={!!createStaff.pending}>
					{createStaff.pending ? 'Creating...' : 'Create Staff'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
