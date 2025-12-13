<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Button } from '$lib/components/ui/button';
	import { Plus } from 'lucide-svelte';

	let { data } = $props();
</script>

<div class="flex h-full flex-col gap-4 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Properties</h1>
			<p class="text-muted-foreground">Manage your properties and rooms.</p>
		</div>
		<Button href="/admin/properties/create">
			<Plus class="mr-2 h-4 w-4" />
			Add Property
		</Button>
	</div>

	<div class="rounded-md border">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Name</Table.Head>
					<Table.Head>Location</Table.Head>
					<Table.Head>Total Rooms</Table.Head>
					<Table.Head class="text-right">Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each data.properties as prop}
					<Table.Row>
						<Table.Cell class="font-medium">{prop.name}</Table.Cell>
						<Table.Cell>
							<div class="flex flex-col">
								<span>{prop.address}</span>
								<!-- Check if city/state exists before rendering -->
								{#if prop.city || prop.state}
									<span class="text-muted-foreground text-xs"
										>{prop.city ?? ''}{prop.city && prop.state ? ', ' : ''}{prop.state ?? ''}</span
									>
								{/if}
							</div>
						</Table.Cell>
						<Table.Cell>{prop.rooms?.length ?? 0}</Table.Cell>
						<Table.Cell class="text-right">
							<Button variant="ghost" size="sm" href="/admin/properties/{prop.id}">Edit</Button>
						</Table.Cell>
					</Table.Row>
				{:else}
					<Table.Row>
						<Table.Cell colspan={4} class="h-24 text-center">No properties found.</Table.Cell>
					</Table.Row>
				{/each}
			</Table.Body>
		</Table.Root>
	</div>
</div>
