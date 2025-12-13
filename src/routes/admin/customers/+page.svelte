<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';
	import { Badge } from '$lib/components/ui/badge';

	let { data } = $props();
</script>

<div class="flex h-full flex-col gap-4 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Customers</h1>
			<p class="text-muted-foreground">Manage your tenants and customers.</p>
		</div>
		<Button href="/admin/customers/create">
			<Plus class="mr-2 h-4 w-4" />
			Add Customer
		</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Contact</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.customers as customer}
					<Table.Row>
						<Table.Cell class="font-medium">
							<div class="flex flex-col">
								<span>{customer.name}</span>
								{#if customer.user}
									<span class="text-xs text-muted-foreground">Linked User</span>
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell>
							<div class="flex flex-col">
								<span>{customer.email}</span>
								<span class="text-muted-foreground text-xs">{customer.phone}</span>
							</div>
						</Table.Cell>
						<Table.Cell>
							{#if customer.status === 'active'}
								<Badge variant="default">Active</Badge>
							{:else}
								<Badge variant="secondary">Inactive</Badge>
							{/if}
						</Table.Cell>
						<Table.Cell class="text-right">
							<Button variant="ghost" size="sm" href="/admin/customers/{customer.id}">Edit</Button>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={4} class="h-24 text-center">No customers found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
