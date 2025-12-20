<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Sheet from '$lib/components/ui/sheet';
	import { toast } from 'svelte-sonner';
	import { updateStaff } from '../staff.remote';

	let { open = $bindable(false), staffMember } = $props<{
		open: boolean;
		staffMember: {
			id: string;
			userId: string;
			name: string;
			email: string;
			role: string;
			staffType?: string;
		};
	}>();

	let selectedRole = $derived(staffMember.role);

	// Determine available roles based on logged-in user
	const userRole = $derived(page.data.user?.role || 'staff');

	const availableRoles = $derived(() => {
		if (userRole === 'admin') {
			return [
				{ value: 'manager', label: 'Manager' },
				{ value: 'property_manager', label: 'Property Manager' },
				{ value: 'staff', label: 'Staff' }
			];
		} else if (userRole === 'manager') {
			return [
				{ value: 'property_manager', label: 'Property Manager' },
				{ value: 'staff', label: 'Staff' }
			];
		} else {
			return [{ value: 'staff', label: 'Staff' }];
		}
	});
</script>

<Sheet.Root bind:open>
	<Sheet.Content class="p-4">
		<Sheet.Header>
			<Sheet.Title>Edit Team Member</Sheet.Title>
		</Sheet.Header>
		<form
			class="space-y-4 mt-4"
			{...updateStaff.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Team member updated successfully');
					open = false;
				} catch (e: any) {
					toast.error(e.message || 'Failed to update team member');
				}
			})}
		>
			<!-- Hidden fields -->
			<input type="hidden" name="id" value={staffMember.id} />
			<input type="hidden" name="userId" value={staffMember.userId} />

			<div class="grid gap-2">
				<Label for="edit-name">Name</Label>
				<Input id="edit-name" name="name" value={staffMember.name} required />
				{#if (updateStaff.fields.name?.issues()?.length ?? 0) > 0}
					<p class="text-sm text-destructive">
						{updateStaff.fields.name
							?.issues()
							?.map((m) => m.message)
							.join(', ')}
					</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="edit-email">Email</Label>
				<Input id="edit-email" name="email" type="email" value={staffMember.email} required />
				{#if (updateStaff.fields.email?.issues()?.length ?? 0) > 0}
					<p class="text-sm text-destructive">
						{updateStaff.fields.email
							?.issues()
							?.map((m) => m.message)
							.join(', ')}
					</p>
				{/if}
			</div>
			<div class="grid gap-2">
				<Label for="edit-role">Role</Label>
				<select
					id="edit-role"
					name="role"
					bind:value={selectedRole}
					required
					class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				>
					{#each availableRoles() as role}
						<option value={role.value}>{role.label}</option>
					{/each}
				</select>
			</div>
			{#if selectedRole === 'staff'}
				<div class="grid gap-2">
					<Label for="edit-staffType">Staff Type</Label>
					<select
						id="edit-staffType"
						name="staffType"
						value={staffMember.staffType || ''}
						required={selectedRole === 'staff'}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="">Select staff type...</option>
						<option value="chef">Chef</option>
						<option value="janitor">Janitor</option>
						<option value="security">Security</option>
					</select>
				</div>
			{/if}
			<Sheet.Footer>
				<Button type="submit" disabled={!!updateStaff.pending}>
					{updateStaff.pending ? 'Updating...' : 'Update Team Member'}
				</Button>
			</Sheet.Footer>
		</form>
	</Sheet.Content>
</Sheet.Root>
