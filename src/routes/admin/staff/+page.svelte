<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Dialog from '$lib/components/ui/dialog';
	import * as Select from '$lib/components/ui/select';

	export let data;
</script>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h2 class="text-3xl font-bold tracking-tight">Staff Management</h2>
		<Dialog.Root>
			<Dialog.Trigger>
				<Button>Add Staff</Button>
			</Dialog.Trigger>
			<Dialog.Content>
				<Dialog.Header>
					<Dialog.Title>Add New Staff Member</Dialog.Title>
				</Dialog.Header>
				<form method="POST" action="?/create" use:enhance class="space-y-4">
					<div class="grid gap-2">
						<Label for="name">Name</Label>
						<Input id="name" name="name" required />
					</div>
					<div class="grid gap-2">
						<Label for="email">Email</Label>
						<Input id="email" name="email" type="email" required />
					</div>
					<div class="grid gap-2">
						<Label for="password">Password</Label>
						<Input id="password" name="password" type="password" required />
					</div>
					<div class="grid gap-2">
						<Label for="staffType">Role Type</Label>
						<select
							name="staffType"
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<option value="chef">Chef</option>
							<option value="janitor">Janitor</option>
							<option value="security">Security</option>
						</select>
					</div>
					<Dialog.Footer>
						<Button type="submit">Create Staff</Button>
					</Dialog.Footer>
				</form>
			</Dialog.Content>
		</Dialog.Root>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Email</Table.Head>
					<Table.Head>Type</Table.Head>
					<!-- <Table.Head>Assigned Properties</Table.Head> -->
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.staff as staff}
					<Table.Row>
						<Table.Cell>{staff.name}</Table.Cell>
						<Table.Cell>{staff.email}</Table.Cell>
						<Table.Cell class="capitalize">{staff.staffType}</Table.Cell>
						<!-- <Table.Cell>{staff.assignments.map(p => p.name).join(', ')}</Table.Cell> -->
						<Table.Cell class="text-right">
							<form method="POST" action="?/delete" use:enhance class="inline-block">
								<input type="hidden" name="id" value={staff.id} />
								<Button variant="destructive" size="sm" type="submit">Delete</Button>
							</form>
						</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
