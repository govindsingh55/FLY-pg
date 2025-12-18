<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import * as Icons from 'lucide-svelte';
	import { Plus, Search, Pencil, Trash, Info } from 'lucide-svelte';
	import { Debounced } from 'runed';
	import { getAmenities, deleteAmenity } from './amenities.remote';
	import AmenityForm from './_components/amenity-form.svelte';
	import { toast } from 'svelte-sonner';

	// Helper to get icon component from name
	function getIcon(name: string | null) {
		if (!name) return Info;
		// Convert kebab-case or snake_case to PascalCase
		const pascalName = name
			.split(/[-_ ]/)
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
			.join('');

		return (Icons as any)[pascalName] || (Icons as any)[name] || Info;
	}

	let searchTerm = $state('');
	let currentPage = $state(1);
	let pageSize = $state(10);
	let isFormOpen = $state(false);
	let selectedAmenity = $state<any>(null);

	const debouncedSearchTerm = new Debounced(() => searchTerm, 500);

	let dataPromise = $derived(
		getAmenities({
			searchTerm: debouncedSearchTerm.current,
			page: currentPage,
			pageSize: pageSize
		})
	);

	function openCreate() {
		selectedAmenity = null;
		isFormOpen = true;
	}

	function openEdit(amenity: any) {
		selectedAmenity = amenity;
		isFormOpen = true;
	}

	async function handleDelete(id: string) {
		if (!confirm('Are you sure you want to delete this amenity?')) return;
		try {
			await deleteAmenity({
				id,
				filterProps: {
					searchTerm: debouncedSearchTerm.current,
					page: currentPage,
					pageSize: pageSize
				}
			});
			toast.success('Amenity deleted');
		} catch (e: any) {
			toast.error(e.message || 'Failed to delete');
		}
	}
</script>

<div class="flex h-full flex-col gap-4 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Amenities</h1>
			<p class="text-muted-foreground">Manage amenities available for properties.</p>
		</div>
		<Button onclick={openCreate}>
			<Plus class="mr-2 h-4 w-4" />
			Add Amenity
		</Button>
	</div>

	<div class="flex items-center gap-2 flex-wrap">
		<InputGroup.Root class="max-w-sm">
			<InputGroup.Input placeholder="Search amenities..." bind:value={searchTerm} />
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
							<Table.Head class="w-12">Icon</Table.Head>
							<Table.Head>Name</Table.Head>
							<Table.Head>Description</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.amenities as amenity}
							{@const IconComp = getIcon(amenity.icon)}
							<Table.Row>
								<Table.Cell>
									<div
										class="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground"
									>
										<IconComp class="h-4 w-4" />
									</div>
								</Table.Cell>
								<Table.Cell class="font-medium">{amenity.name}</Table.Cell>
								<Table.Cell class="max-w-xs truncate text-muted-foreground">
									{amenity.description || 'No description'}
								</Table.Cell>
								<Table.Cell class="text-right">
									<div class="flex justify-end gap-1">
										<Button variant="ghost" size="icon" onclick={() => openEdit(amenity)}>
											<Pencil class="h-4 w-4" />
										</Button>
										<Button
											variant="ghost"
											size="icon"
											class="text-destructive"
											onclick={() => handleDelete(amenity.id)}
										>
											<Trash class="h-4 w-4" />
										</Button>
									</div>
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={4} class="h-24 text-center">No amenities found.</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>

				{#if data.totalPages > 1}
					<div class="flex flex-col p-4 gap-4">
						<div class="flex items-center justify-between gap-4">
							<p class="text-sm text-muted-foreground">
								Showing {(data.page - 1) * data.pageSize + 1} to {Math.min(
									data.page * data.pageSize,
									data.total
								)} of {data.total} amenities
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
					<Button variant="outline" onclick={() => (dataPromise = getAmenities({}))} class="mt-2">
						Try Again
					</Button>
				</div>
			{/await}
		</svelte:boundary>
	</div>
</div>

<AmenityForm bind:open={isFormOpen} amenity={selectedAmenity} />
