<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import { type DateValue } from '@internationalized/date';
	import { Calendar as CalendarIcon, Search, X } from '@lucide/svelte';
	import { Debounced } from 'runed';
	import { toast } from 'svelte-sonner';
	import { deleteVisit, getVisits, updateVisitStatus } from './visits.remote';

	let searchTerm = $state('');
	let dateFrom = $state<DateValue | undefined>(undefined);
	let dateTo = $state<DateValue | undefined>(undefined);
	let currentPage = $state(1);
	let pageSize = $state(10);

	const debouncedSearchTerm = new Debounced(() => searchTerm, 500);

	let visitsPromise = $derived(
		getVisits({
			searchTerm: debouncedSearchTerm.current,
			dateFrom: dateFrom?.toString(),
			dateTo: dateTo?.toString(),
			page: currentPage,
			pageSize: pageSize
		})
	);

	let datePopoverOpen = $state(false);
	let dateToPopoverOpen = $state(false);

	function clearDateFilter() {
		dateFrom = undefined;
		dateTo = undefined;
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h2 class="text-3xl font-bold tracking-tight">Visit Management</h2>
	</div>

	<div class="flex items-center gap-2 flex-wrap">
		<InputGroup.Root class="max-w-sm">
			<InputGroup.Input placeholder="Search by property or customer..." bind:value={searchTerm} />
			<InputGroup.Button>
				<Search class="h-4 w-4" />
			</InputGroup.Button>
		</InputGroup.Root>

		<Popover.Root bind:open={datePopoverOpen}>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" class="justify-start text-left font-normal" {...props}>
						<CalendarIcon class="mr-2 h-4 w-4" />
						{#if dateFrom}
							From: {dateFrom.toString()}
						{:else}
							Start Date
						{/if}
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0" align="start">
				<Calendar type="single" bind:value={dateFrom} placeholder={dateFrom} />
				<div class="p-3 border-t flex justify-end">
					<Button size="sm" onclick={() => (datePopoverOpen = false)}>Done</Button>
				</div>
			</Popover.Content>
		</Popover.Root>

		<Popover.Root bind:open={dateToPopoverOpen}>
			<Popover.Trigger>
				{#snippet child({ props })}
					<Button variant="outline" class="justify-start text-left font-normal" {...props}>
						<CalendarIcon class="mr-2 h-4 w-4" />
						{#if dateTo}
							To: {dateTo.toString()}
						{:else}
							End Date
						{/if}
					</Button>
				{/snippet}
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0" align="start">
				<Calendar type="single" bind:value={dateTo} placeholder={dateTo} />
				<div class="p-3 border-t flex justify-end">
					<Button size="sm" onclick={() => (dateToPopoverOpen = false)}>Done</Button>
				</div>
			</Popover.Content>
		</Popover.Root>

		{#if dateFrom || dateTo}
			<Button variant="ghost" size="icon" onclick={clearDateFilter}>
				<X class="h-4 w-4" />
			</Button>
		{/if}
	</div>

	<div class="rounded-md border">
		<svelte:boundary>
			{#await visitsPromise}
				<div class="p-4 space-y-4">
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
				</div>
			{:then data}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Date & Time</Table.Head>
							<Table.Head>Property</Table.Head>
							<Table.Head>Customer</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.visits as visit}
							<Table.Row>
								<Table.Cell>
									<div class="font-medium">{new Date(visit.visitDate).toLocaleDateString()}</div>
									<div class="text-xs text-muted-foreground">
										{visit.visitTime
											? new Date(visit.visitTime).toLocaleTimeString([], {
													hour: '2-digit',
													minute: '2-digit'
												})
											: '-'}
									</div>
								</Table.Cell>
								<Table.Cell>{visit.property?.name}</Table.Cell>
								<Table.Cell>
									<div>{visit.customer?.name}</div>
									<div class="text-xs text-muted-foreground">{visit.customer?.phone}</div>
								</Table.Cell>
								<Table.Cell>
									<Badge
										variant={visit.status === 'accepted'
											? 'default'
											: visit.status === 'pending'
												? 'secondary'
												: 'destructive'}
									>
										{visit.status}
									</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">
									{#if visit.status === 'pending'}
										<div class="flex justify-end gap-2">
											<form
												{...updateVisitStatus
													.for(`accept-${visit.id}`)
													.enhance(async ({ submit }) => {
														try {
															await submit();
															toast.success('Visit accepted');
														} catch (e: any) {
															toast.error(e.message || 'Failed');
														}
													})}
											>
												<input type="hidden" name="visitId" value={visit.id} />
												<input type="hidden" name="status" value="accepted" />
												<Button
													size="sm"
													variant="default"
													type="submit"
													disabled={!!updateVisitStatus.pending}
												>
													Accept
												</Button>
											</form>
											<form
												{...updateVisitStatus
													.for(`reject-${visit.id}`)
													.enhance(async ({ submit }) => {
														if (!confirm('Reject this visit?')) return;
														try {
															await submit();
															toast.success('Visit rejected');
														} catch (e: any) {
															toast.error(e.message || 'Failed');
														}
													})}
											>
												<input type="hidden" name="visitId" value={visit.id} />
												<input type="hidden" name="status" value="rejected" />
												<Button
													size="sm"
													variant="ghost"
													type="submit"
													disabled={!!updateVisitStatus.pending}
												>
													Reject
												</Button>
											</form>
										</div>
									{:else}
										<form
											{...deleteVisit.for(`delete-${visit.id}`).enhance(async ({ submit }) => {
												if (!confirm('Delete this visit record?')) return;
												try {
													await submit();
													toast.success('Visit deleted');
												} catch (e: any) {
													toast.error(e.message || 'Failed');
												}
											})}
										>
											<input type="hidden" name="id" value={visit.id} />
											<Button
												size="sm"
												variant="ghost"
												class="text-destructive hover:text-destructive"
												type="submit"
												disabled={!!deleteVisit.pending}
											>
												Delete
											</Button>
										</form>
									{/if}
								</Table.Cell>
							</Table.Row>
						{/each}
						{#if data.visits?.length === 0}
							<Table.Row>
								<Table.Cell colspan={5} class="text-center text-muted-foreground h-24">
									No visits found.
								</Table.Cell>
							</Table.Row>
						{/if}
					</Table.Body>
				</Table.Root>

				{#if data.totalPages && data.totalPages > 1}
					<div class="flex flex-col p-4 gap-4">
						<div class="flex items-center justify-between gap-4">
							<p class="text-sm text-muted-foreground">
								Showing {(data.page - 1) * data.pageSize + 1} to {Math.min(
									data.page * data.pageSize,
									data.total
								)} of {data.total} visits
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
			{/await}
		</svelte:boundary>
	</div>
</div>
