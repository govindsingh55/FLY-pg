<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import * as Card from '$lib/components/ui/card';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Popover from '$lib/components/ui/popover';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import { type DateValue } from '@internationalized/date';
	import { ArrowBigRight, Calendar as CalendarIcon, Loader, Plus, Search, X } from '@lucide/svelte';
	import { Debounced } from 'runed';
	import { getCustomers } from '../customers/customers.remote';
	import { getProperties } from '../properties/properties.remote';
	import BookingForm from './_components/booking-form.svelte';
	import { getBookings } from './bookings.remote';

	let searchTerm = $state('');
	let dateFrom = $state<DateValue | undefined>(undefined);
	let dateTo = $state<DateValue | undefined>(undefined);
	let currentPage = $state(1);
	let pageSize = $state(10);
	let bookingSheetOpen = $state(false);
	let datePopoverOpen = $state(false);
	let dateToPopoverOpen = $state(false);

	const debouncedSearchTerm = new Debounced(() => searchTerm, 500);

	let bookingsPromise = $derived(
		getBookings({
			searchTerm: debouncedSearchTerm.current,
			page: currentPage,
			pageSize: pageSize
		})
	);

	let dependenciesPromise = $derived(Promise.all([getProperties({}), getCustomers({})]));
</script>

<div class="flex items-center justify-between space-y-2 p-6">
	<h2 class="text-3xl font-bold tracking-tight">Bookings</h2>
	<div class="flex items-center space-x-2">
		<Button onclick={() => (bookingSheetOpen = true)}>
			<Plus class="mr-2 h-4 w-4" /> Add Booking
		</Button>
	</div>
</div>

<div class="p-6 pt-0 space-y-4">
	<div class="flex items-center gap-2 flex-wrap">
		<InputGroup.Root class="max-w-sm">
			<InputGroup.Input placeholder="Search..." bind:value={searchTerm} />
			<InputGroup.Button>
				<Search class="h-4 w-4" />
			</InputGroup.Button>
		</InputGroup.Root>
	</div>

	<svelte:boundary>
		{#await bookingsPromise}
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
								<Table.Head>Property</Table.Head>
								<Table.Head>Room</Table.Head>
								<Table.Head>Customer</Table.Head>
								<Table.Head>Dates</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head class="text-right">Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each data.bookings as booking}
								<Table.Row>
									<Table.Cell class="font-medium">
										{booking.property?.name || 'Unknown'}
									</Table.Cell>
									<Table.Cell>
										{booking.room?.number || booking.roomId}
									</Table.Cell>
									<Table.Cell>
										{booking.customer?.name || booking.customerId}
									</Table.Cell>
									<Table.Cell>
										{booking.contract?.startDate
											? new Date(booking.contract.startDate).toLocaleDateString()
											: 'N/A'} -
										{booking.contract?.endDate
											? new Date(booking.contract.endDate).toLocaleDateString()
											: 'Ongoing'}
									</Table.Cell>
									<Table.Cell>
										<Badge variant={booking.status === 'confirmed' ? 'default' : 'secondary'}>
											{booking.status}
										</Badge>
									</Table.Cell>
									<Table.Cell class="text-right">
										<Button variant="outline" size="icon" href="/admin/bookings/{booking.id}">
											<ArrowBigRight class="h-4 w-4" />
										</Button>
									</Table.Cell>
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell colspan={6} class="h-24 text-center">No bookings found.</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>

			{#if data.totalPages && data.totalPages > 1}
				<div class="flex flex-col p-4 gap-4">
					<div class="flex items-center justify-between gap-4">
						<p class="text-sm text-muted-foreground">
							Showing {(data.page - 1) * data.pageSize + 1} to {Math.min(
								data.page * data.pageSize,
								data.total
							)} of {data.total} bookings
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
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading bookings</h3>
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
{:then [propsResult, customersResult]}
	<BookingForm
		bind:open={bookingSheetOpen}
		properties={propsResult?.properties}
		customers={customersResult.customers}
	/>
{/await}
