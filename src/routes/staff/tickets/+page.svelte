<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Search, MessageSquare, FilterX, Clock } from '@lucide/svelte';
	import { Debounced } from 'runed';
	import { getStaffTickets } from './tickets.remote';
	import { formatDistanceToNow } from 'date-fns';

	let searchTerm = $state('');
	let statusFilter = $state<string>('');
	let priorityFilter = $state<string>('');
	let assignmentFilter = $state<string>('all');
	let currentPage = $state(1);
	let pageSize = $state(10);

	const debouncedSearchTerm = new Debounced(() => searchTerm, 500);

	let dataPromise = $derived(
		getStaffTickets({
			searchTerm: debouncedSearchTerm.current,
			status: (statusFilter as any) || undefined,
			priority: (priorityFilter as any) || undefined,
			assignmentFilter: (assignmentFilter as any) || 'all',
			page: currentPage,
			pageSize: pageSize
		})
	);

	const statusColors: Record<string, string> = {
		open: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
		in_progress: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
		resolved: 'bg-green-500/10 text-green-500 border-green-500/20',
		closed: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
	};

	const priorityColors: Record<string, string> = {
		low: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
		medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
		high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
	};

	function resetFilters() {
		searchTerm = '';
		statusFilter = '';
		priorityFilter = '';
		assignmentFilter = 'all';
		currentPage = 1;
	}
</script>

<div class="flex h-full flex-col gap-4 p-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">My Tickets</h1>
			<p class="text-muted-foreground">View and manage your assigned tickets</p>
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<InputGroup.Root class="max-w-sm">
			<InputGroup.Input placeholder="Search subject/description..." bind:value={searchTerm} />
			<InputGroup.Button>
				<Search class="h-4 w-4" />
			</InputGroup.Button>
		</InputGroup.Root>

		<Select.Root
			type="single"
			bind:value={assignmentFilter}
			onValueChange={() => (currentPage = 1)}
		>
			<Select.Trigger class="w-[160px]">
				{assignmentFilter === 'assigned'
					? 'Assigned to Me'
					: assignmentFilter === 'unassigned'
						? 'Unassigned'
						: 'All Tickets'}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="all">All Tickets</Select.Item>
				<Select.Item value="assigned">Assigned to Me</Select.Item>
				<Select.Item value="unassigned">Unassigned</Select.Item>
			</Select.Content>
		</Select.Root>

		<Select.Root type="single" bind:value={statusFilter} onValueChange={() => (currentPage = 1)}>
			<Select.Trigger class="w-[140px]">
				{statusFilter ? statusFilter.replace('_', ' ').toUpperCase() : 'All Statuses'}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="">All Statuses</Select.Item>
				<Select.Item value="open">Open</Select.Item>
				<Select.Item value="in_progress">In Progress</Select.Item>
				<Select.Item value="resolved">Resolved</Select.Item>
				<Select.Item value="closed">Closed</Select.Item>
			</Select.Content>
		</Select.Root>

		<Select.Root type="single" bind:value={priorityFilter} onValueChange={() => (currentPage = 1)}>
			<Select.Trigger class="w-[140px]">
				{priorityFilter ? priorityFilter.toUpperCase() : 'All Priorities'}
			</Select.Trigger>
			<Select.Content>
				<Select.Item value="">All Priorities</Select.Item>
				<Select.Item value="low">Low</Select.Item>
				<Select.Item value="medium">Medium</Select.Item>
				<Select.Item value="high">High</Select.Item>
			</Select.Content>
		</Select.Root>

		{#if searchTerm || statusFilter || priorityFilter || assignmentFilter !== 'all'}
			<Button variant="ghost" size="sm" onclick={resetFilters} class="h-10">
				<FilterX class="mr-2 h-4 w-4" />
				Clear
			</Button>
		{/if}
	</div>

	<div class="rounded-md border bg-card">
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
							<Table.Head>Ticket Details</Table.Head>
							<Table.Head>Resident</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head>Priority</Table.Head>
							<Table.Head>Assignment</Table.Head>
							<Table.Head>Updated</Table.Head>
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.tickets as ticket}
							<Table.Row>
								<Table.Cell>
									<div class="flex flex-col gap-1">
										<span class="font-medium">{ticket.subject}</span>
										<div class="flex items-center gap-2 text-xs text-muted-foreground">
											<Badge variant="outline" class="font-normal capitalize">{ticket.type}</Badge>
											<span>at {ticket.property?.name || 'Unknown Property'}</span>
										</div>
									</div>
								</Table.Cell>
								<Table.Cell>
									<div class="flex flex-col">
										<span class="text-sm">{ticket.customer?.name}</span>
										<span class="text-xs text-muted-foreground">{ticket.customer?.phone}</span>
									</div>
								</Table.Cell>
								<Table.Cell>
									<Badge
										class={`capitalize border ${statusColors[ticket.status!] || ''}`}
										variant="outline"
									>
										{ticket.status?.replace('_', ' ')}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									<Badge
										class={`capitalize font-normal ${priorityColors[ticket.priority!] || ''}`}
										variant="secondary"
									>
										{ticket.priority}
									</Badge>
								</Table.Cell>
								<Table.Cell>
									{#if ticket.assignedTo}
										<Badge variant="default" class="text-xs">
											{ticket.assignedStaff?.name || 'Assigned'}
										</Badge>
									{:else}
										<Badge variant="outline" class="text-xs text-muted-foreground">
											Unassigned
										</Badge>
									{/if}
								</Table.Cell>
								<Table.Cell>
									<div class="flex items-center gap-1 text-xs text-muted-foreground">
										<Clock class="h-3 w-3" />
										{ticket.updatedAt
											? formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })
											: 'Never'}
									</div>
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="outline"
										size="sm"
										href={`/staff/tickets/${ticket.id}`}
										class="gap-2"
									>
										<MessageSquare class="h-4 w-4" />
										View & Chat
									</Button>
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={7} class="h-24 text-center">No tickets found.</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>

				{#if data.totalPages > 1}
					<div class="flex items-center justify-between p-4 border-t">
						<p class="text-sm text-muted-foreground">
							Showing {(data.page - 1) * data.pageSize + 1} to {Math.min(
								data.page * data.pageSize,
								data.total
							)} of {data.total} tickets
						</p>
						<div class="flex items-center gap-4">
							<Select.Root
								type="single"
								value={`${pageSize}`}
								onValueChange={(v) => (pageSize = Number(v))}
							>
								<Select.Trigger class="w-[80px]">{pageSize}</Select.Trigger>
								<Select.Content>
									<Select.Item value="10">10</Select.Item>
									<Select.Item value="25">25</Select.Item>
									<Select.Item value="50">50</Select.Item>
								</Select.Content>
							</Select.Root>
							<Pagination.Root
								count={data.total}
								perPage={data.pageSize}
								page={currentPage}
								onPageChange={(p) => (currentPage = p)}
							>
								{#snippet children({ pages, currentPage })}
									<Pagination.Content>
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
				</div>
			{/await}
		</svelte:boundary>
	</div>
</div>
