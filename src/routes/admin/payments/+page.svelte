<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Card from '$lib/components/ui/card';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Popover from '$lib/components/ui/popover';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import { type DateValue } from '@internationalized/date';
	import { Calendar as CalendarIcon, Plus, Search, X } from 'lucide-svelte';
	import { Debounced } from 'runed';
	import { getBookings } from '../bookings/bookings.remote';
	import { getCustomers } from '../customers/customers.remote';
	import PaymentForm from './_components/payment-form.svelte';
	import { getPayments } from './payments.remote';
	import * as Select from '$lib/components/ui/select';

	let searchTerm = $state('');
	let dateFrom = $state<DateValue | undefined>(undefined);
	let dateTo = $state<DateValue | undefined>(undefined);
	let currentPage = $state(1);
	let pageSize = $state(10);

	const debouncedSearchTerm = new Debounced(() => searchTerm, 500);

	let paymentsPromise = $derived(
		getPayments({
			searchTerm: debouncedSearchTerm.current,
			dateFrom: dateFrom?.toString(),
			dateTo: dateTo?.toString(),
			page: currentPage,
			pageSize: pageSize
		})
	);
	let dependenciesPromise = $derived(Promise.all([getCustomers(), getBookings(undefined)]));

	let paymentSheetOpen = $state(false);
	let datePopoverOpen = $state(false);
	let dateToPopoverOpen = $state(false);

	function clearDateFilter() {
		dateFrom = undefined;
		dateTo = undefined;
	}
</script>

<div class="flex items-center justify-between space-y-2 p-6">
	<h2 class="text-3xl font-bold tracking-tight">Payments</h2>
	<div class="flex items-center space-x-2">
		<Button onclick={() => (paymentSheetOpen = true)}>
			<Plus class="mr-2 h-4 w-4" /> Record Payment
		</Button>
	</div>
</div>

<div class="p-6 pt-0 space-y-4">
	<div class="flex items-center gap-2 flex-wrap">
		<InputGroup.Root class="max-w-sm">
			<InputGroup.Input placeholder="Search payments..." bind:value={searchTerm} />
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

	<svelte:boundary>
		{#await paymentsPromise}
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
								<Table.Head>Date</Table.Head>
								<Table.Head>Customer</Table.Head>
								<Table.Head>Property / Booking</Table.Head>
								<Table.Head>Type</Table.Head>
								<Table.Head>Mode</Table.Head>
								<Table.Head>Amount</Table.Head>
								<Table.Head>Status</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.payments as payment}
								<Table.Row>
									<Table.Cell>
										{payment.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : '-'}
									</Table.Cell>
									<Table.Cell class="font-medium">
										{payment.customer?.name || 'Unknown'}
									</Table.Cell>
									<Table.Cell>
										{#if payment.booking}
											{payment.booking.property?.name}
											<span class="text-muted-foreground text-xs"
												>({payment.booking.room?.number})</span
											>
										{:else}
											<span class="text-muted-foreground">-</span>
										{/if}
									</Table.Cell>
									<Table.Cell class="capitalize">
										{payment.type.replace('_', ' ')}
									</Table.Cell>
									<Table.Cell class="capitalize">
										{payment.mode}
									</Table.Cell>
									<Table.Cell>
										${payment.amount}
									</Table.Cell>
									<Table.Cell>
										<Badge
											variant={payment.status === 'paid'
												? 'default'
												: payment.status === 'pending'
													? 'secondary'
													: 'destructive'}
										>
											{payment.status}
										</Badge>
									</Table.Cell>
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell colspan={6} class="h-24 text-center">No payments found.</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>

			{#if data.totalPages && data.totalPages > 1}
				<div class="flex flex-col">
					<div class="flex items-center justify-between gap-4">
						<p class="text-sm text-muted-foreground">
							Showing {(data.page - 1) * data.pageSize + 1} to {Math.min(
								data.page * data.pageSize,
								data.total
							)} of {data.total} payments
						</p>
						<Select.Root
							type="single"
							value={`${pageSize}`}
							onValueChange={(value) => Number(value) && (pageSize = Number(value))}
						>
							<Select.Trigger class="w-auto]">
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
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading payments</h3>
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

{#await dependenciesPromise}
	<!-- Loading dependencies silently -->
{:then [customersResult, bookingsResult]}
	<PaymentForm
		bind:open={paymentSheetOpen}
		customers={customersResult.customers}
		bookings={bookingsResult.bookings}
	/>
{/await}
