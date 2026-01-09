<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import { Eye, Search, Trash } from '@lucide/svelte';
	import { Debounced } from 'runed';
	import { toast } from 'svelte-sonner';
	import { deleteContract, getContracts } from './contracts.remote';

	let searchTerm = $state('');
	let statusFilter = $state('all');
	let currentPage = $state(1);
	let pageSize = $state(10);

	const debouncedSearchTerm = new Debounced(() => searchTerm, 500);

	let contractsPromise = $derived(
		getContracts({
			searchTerm: debouncedSearchTerm.current,
			status: statusFilter === 'all' ? undefined : (statusFilter as any),
			page: currentPage,
			pageSize: pageSize
		})
	);
</script>

<div class="flex items-center justify-between space-y-2 p-6">
	<h2 class="text-3xl font-bold tracking-tight">Contracts</h2>
</div>

<div class="p-6 pt-0 space-y-4">
	<div class="flex items-center gap-2 flex-wrap">
		<InputGroup.Root class="max-w-sm">
			<InputGroup.Input placeholder="Search contracts..." bind:value={searchTerm} />
			<InputGroup.Button>
				<Search class="h-4 w-4" />
			</InputGroup.Button>
		</InputGroup.Root>

		<Select.Root type="single" bind:value={statusFilter}>
			<Select.Trigger class="w-[180px]">
				{statusFilter === 'all'
					? 'All Statuses'
					: statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="all">All Statuses</Select.Item>
				<Select.Item value="active">Active</Select.Item>
				<Select.Item value="expired">Expired</Select.Item>
				<Select.Item value="terminated">Terminated</Select.Item>
			</Select.Content>
		</Select.Root>
	</div>

	<svelte:boundary>
		{#await contractsPromise}
			<div class="space-y-4">
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
				<Skeleton class="h-12 w-full" />
			</div>
		{:then data}
			<Card.Root>
				<Card.Content class="p-0">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>ID</Table.Head>
								<Table.Head>Customer</Table.Head>
								<Table.Head>Property</Table.Head>
								<Table.Head>Dates</Table.Head>
								<Table.Head>Rent</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head class="text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.contracts as contract}
								<Table.Row>
									<Table.Cell class="font-medium text-xs">
										{contract.id.slice(0, 8)}...
									</Table.Cell>
									<Table.Cell>
										{contract.customer?.name || 'N/A'}
									</Table.Cell>
									<Table.Cell>
										{contract.property?.name || 'N/A'} / {contract.room?.number || 'N/A'}
									</Table.Cell>
									<Table.Cell>
										{new Date(contract.startDate).toLocaleDateString()} -
										{contract.endDate ? new Date(contract.endDate).toLocaleDateString() : 'Ongoing'}
									</Table.Cell>
									<Table.Cell>
										${contract.rentAmount}
									</Table.Cell>
									<Table.Cell>
										<Badge
											variant={contract.status === 'active'
												? 'default'
												: contract.status === 'expired'
													? 'destructive'
													: 'secondary'}
										>
											{contract.status}
										</Badge>
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex justify-end gap-2">
											<Button variant="outline" size="icon" href="/admin/contracts/{contract.id}">
												<Eye class="h-4 w-4" />
											</Button>

											<form
												{...deleteContract.for(`delete-contract-${contract.id}`).enhance(async ({ submit }: { submit: () => void }) => {
													if (!confirm('Are you sure you want to delete this contract?')) return;
													try {
														await submit();
														toast.success('Contract deleted');
													} catch (e: any) {
														toast.error(e.message || 'Failed to delete');
													}
												})}
												class="inline-block"
											>
												<input type="hidden" name="id" value={contract.id} />
												<Button
													variant="ghost"
													size="icon"
													type="submit"
													class="text-destructive hover:text-destructive"
													disabled={!!deleteContract.pending}
												>
													<Trash class="h-4 w-4" />
												</Button>
											</form>
										</div>
									</Table.Cell>
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell colspan={7} class="h-24 text-center">No contracts found.</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>

			{#if data.totalPages > 1}
				<div class="flex flex-col p-4 gap-4">
					<div class="flex items-center justify-between gap-4">
						<p class="text-sm text-muted-foreground">
							Showing {(data.page - 1) * data.pageSize + 1} to {Math.min(
								data.page * data.pageSize,
								data.total
							)} of {data.total} contracts
						</p>
						<Select.Root
							type="single"
							value={`${pageSize}`}
							onValueChange={(value) => Number(value) && (pageSize = Number(value))}
						>
							<Select.Trigger class="w-auto">
								{pageSize}
							</Select.Trigger>
							<Select.Content>
								<Select.Item value="10">10</Select.Item>
								<Select.Item value="25">25</Select.Item>
								<Select.Item value="50">50</Select.Item>
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
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading contracts</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button onclick={() => window.location.reload()}>Retry</Button>
			</div>
		{/await}
		{#snippet failed(error: any, reset)}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Something went wrong</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button onclick={reset}>Try again</Button>
			</div>
		{/snippet}
	</svelte:boundary>
</div>
