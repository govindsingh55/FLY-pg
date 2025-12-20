<script lang="ts">
	import { authClient } from '$lib/auth-client';
	import { Button } from '$lib/components/ui/button';
	import * as InputGroup from '$lib/components/ui/input-group';
	import * as Pagination from '$lib/components/ui/pagination';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import * as Table from '$lib/components/ui/table';
	import { Search } from 'lucide-svelte';
	import { Debounced } from 'runed';
	import { toast } from 'svelte-sonner';
	import StaffForm from './_components/staff-form.svelte';
	import { deleteStaff, getStaff } from './staff.remote';

	let searchTerm = $state('');
	let currentPage = $state(1);
	let pageSize = $state(10);
	let staffDialogOpen = $state(false);

	const debouncedSearchTerm = new Debounced(() => searchTerm, 500);

	let staffPromise = $derived(
		getStaff({
			searchTerm: debouncedSearchTerm.current,
			page: currentPage,
			pageSize: pageSize
		})
	);

	async function impersonate(userId: string) {
		try {
			toast.loading('Starting impersonation...');
			console.log('Attempting to impersonate user:', userId);

			const result = await authClient.admin.impersonateUser({
				userId
			});

			console.log('Impersonation result:', result);
			toast.dismiss();
			toast.success('Impersonation started');
			// Force reload/redirect to ensure session is picked up
			window.location.href = '/admin';
		} catch (e: any) {
			toast.dismiss();
			console.error('Impersonation error:', e);
			console.error('Error details:', {
				message: e?.message,
				status: e?.status,
				response: e?.response
			});
			toast.error(`Failed to impersonate: ${e?.message || 'Unknown error'}`);
		}
	}
</script>

<div class="space-y-6 p-6">
	<div class="flex items-center justify-between">
		<h2 class="text-3xl font-bold tracking-tight">Staff Management</h2>
		<Button onclick={() => (staffDialogOpen = true)}>Add Staff</Button>
	</div>

	<div class="flex items-center gap-2 flex-wrap">
		<InputGroup.Root class="max-w-sm">
			<InputGroup.Input placeholder="Search staff..." bind:value={searchTerm} />
			<InputGroup.Button>
				<Search class="h-4 w-4" />
			</InputGroup.Button>
		</InputGroup.Root>
	</div>

	<StaffForm bind:open={staffDialogOpen} />

	<div class="rounded-md border">
		<svelte:boundary>
			{#await staffPromise}
				<div class="p-4 space-y-4">
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
				</div>
			{:then data}
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Name</Table.Head>
							<Table.Head>Email</Table.Head>
							<Table.Head>Role / Type</Table.Head>
							<!-- <Table.Head>Assigned Properties</Table.Head> -->
							<Table.Head class="text-right">Actions</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.staff as s}
							<Table.Row>
								<Table.Cell>
									<div class="flex flex-col">
										<span class="font-medium">{s.name || 'Unknown'}</span>
										{#if s.assignments && s.assignments.length > 0}
											<span class="text-xs text-muted-foreground">
												{s.assignments.map((a) => a.name).join(', ')}
											</span>
										{/if}
									</div>
								</Table.Cell>
								<Table.Cell>{s.email || '-'}</Table.Cell>
								<Table.Cell>
									<span class="capitalize badge">{s.role}</span>
									{#if s.staffType}
										<span class="text-xs text-muted-foreground block capitalize">
											({s.staffType})
										</span>
									{/if}
								</Table.Cell>
								<Table.Cell class="text-right">
									<Button
										variant="outline"
										size="sm"
										class="mr-2"
										onclick={() => impersonate(s.userId)}
									>
										Impersonate
									</Button>

									<form
										class="inline-block"
										{...deleteStaff.for(`delete-${s.id}`).enhance(async ({ submit }) => {
											if (!confirm('Delete this staff member?')) return;
											try {
												await submit();
												toast.success('Staff deleted');
											} catch (e) {
												toast.error('Failed to delete');
											}
										})}
									>
										<input type="hidden" name="id" value={s.id} />
										<Button
											variant="destructive"
											size="sm"
											type="submit"
											disabled={!!deleteStaff.pending}
										>
											Delete
										</Button>
									</form>
								</Table.Cell>
							</Table.Row>
						{:else}
							<Table.Row>
								<Table.Cell colspan={4} class="h-24 text-center">No staff members found.</Table.Cell
								>
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
								)} of {data.total} staff members
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
					<h3 class="font-semibold mb-2">Error loading staff</h3>
					<p class="text-sm opacity-70 mb-4">{error.message}</p>
					<Button
						onclick={() => (staffPromise = getStaff({ searchTerm, page: currentPage, pageSize }))}
						>Retry</Button
					>
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
</div>
