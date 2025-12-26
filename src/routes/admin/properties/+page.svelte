<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import { Plus, Search } from 'lucide-svelte';
	import { Debounced } from 'runed';
	import { getProperties, updatePropertyStatus } from './properties.remote';
	import { toast } from 'svelte-sonner';

	let searchTerm = $state('');
	let currentPage = $state(1);
	let pageSize = $state(10);

	const debouncedSearchTerm = new Debounced(() => searchTerm, 500);

	let dataPromise = $derived(
		getProperties({
			searchTerm: debouncedSearchTerm.current,
			page: currentPage,
			pageSize: pageSize
		})
	);
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

	<div class="flex items-center gap-2 flex-wrap">
		<InputGroup.Root class="max-w-sm">
			<InputGroup.Input placeholder="Search properties..." bind:value={searchTerm} />
			<InputGroup.Button>
				<Search class="h-4 w-4" />
			</InputGroup.Button>
		</InputGroup.Root>
	</div>

	<div class="rounded-md border">
		<svelte:boundary>
			{#await dataPromise}
				<div class="p-4 space-y-4">
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
				</div>
			{:then data}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Location</Table.Head>
							<Table.Head>Total Rooms</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.properties as prop}
							<Table.Row>
								<Table.Cell class="font-medium">{prop.name}</Table.Cell>
								<Table.Cell>
									<div class="flex flex-col">
										{prop.address}
									</div>
								</Table.Cell>
								<Table.Cell>{prop.rooms?.length ?? 0}</Table.Cell>
								<Table.Cell>
									<Select.Root
										type="single"
										value={prop.status ?? undefined}
										onValueChange={async (val) => {
											try {
												await updatePropertyStatus({
													id: prop.id,
													status: val as 'draft' | 'published',
													filterProps: {
														searchTerm: debouncedSearchTerm.current,
														page: currentPage,
														pageSize: pageSize
													}
												});
												toast.success('Status updated');
											} catch (e: any) {
												toast.error(e.message || 'Failed to update status');
											}
										}}
									>
										<Select.Trigger class="w-[120px] h-8 text-xs capitalize">
											{prop.status}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="draft" label="Draft">Draft</Select.Item>
											<Select.Item value="published" label="Published">Published</Select.Item>
										</Select.Content>
									</Select.Root>
								</Table.Cell>
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

				{#if data.totalPages && data.totalPages > 1}
					<div class="flex flex-col p-4 gap-4">
						<div class="flex items-center justify-between gap-4">
							<p class="text-sm text-muted-foreground">
								Showing {(data.page - 1) * data.pageSize + 1} to {Math.min(
									data.page * data.pageSize,
									data.total
								)} of {data.total} properties
							</p>
							<Select.Root
								type="single"
								value={`${pageSize}`}
								onValueChange={(value) => Number(value) && (pageSize = Number(value))}
							>
								<Select.Trigger class="w-auto">
									{pageSize ?? 'Select a size'}
								</Select.Trigger>
								<Select.Content>
									<Select.Item value="10">10</Select.Item>
									<Select.Item value="25">25</Select.Item>
									<Select.Item value="50">50</Select.Item>
									<Select.Item value="100">100</Select.Item>
								</Select.Content>
							</Select.Root>
						</div>
						<div class="flex items-center justify-end w-full">
							<Pagination.Root
								count={data.total}
								perPage={data.pageSize}
								page={currentPage}
								onPageChange={(page) => (currentPage = page)}
							>
								{#snippet children({ pages, currentPage })}
									<Pagination.Content class="justify-end w-full">
										<Pagination.Item>
											<Pagination.PrevButton />
										</Pagination.Item>
										{#each pages as page (page.key)}
											{#if page.type === 'ellipsis'}
												<Pagination.Item>
													<Pagination.Ellipsis />
												</Pagination.Item>
											{:else}
												<Pagination.Item>
													<Pagination.Link {page} isActive={currentPage == page.value}>
														{page.value}
													</Pagination.Link>
												</Pagination.Item>
											{/if}
										{/each}
										<Pagination.Item>
											<Pagination.NextButton />
										</Pagination.Item>
									</Pagination.Content>
								{/snippet}
							</Pagination.Root>
						</div>
					</div>
				{/if}
			{:catch error}
				<div class="p-8 text-center text-destructive">
					<p>Error: {error.message}</p>
					<Button variant="outline" onclick={() => (dataPromise = getProperties({}))} class="mt-2">
						Try Again
					</Button>
				</div>
			{/await}
			{#snippet failed(error: any, reset)}
				<div class="p-8 text-center text-destructive">
					<p>Something went wrong: {error.message}</p>
					<Button variant="outline" onclick={reset} class="mt-2">Try Again</Button>
				</div>
			{/snippet}
		</svelte:boundary>
	</div>
</div>
