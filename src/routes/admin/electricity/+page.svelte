<script lang="ts">
	import { page } from '$app/state';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import * as Table from '$lib/components/ui/table';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Command from '$lib/components/ui/command';
	import * as Popover from '$lib/components/ui/popover';
	import { cn } from '$lib/utils';
	import { Plus, Zap, Check, ChevronsUpDown } from 'lucide-svelte';
	import { toast } from 'svelte-sonner';
	import { getContracts } from '../contracts/contracts.remote';
	import { getReadings, recordReading } from './electricity.remote';
	import { tick } from 'svelte';

	let open = $state(false);
	let comboboxOpen = $state(false);

	// Form State
	let selectedContractId = $state('');
	let month = $state(new Date().getMonth() + 1);
	let year = $state(new Date().getFullYear());
	let unitsConsumed = $state(0);
	let note = $state('');

	// Derived for preview
	let contractsPromise = $derived(getContracts({ pageSize: 100, status: 'active' }));
	let readingsPromise = $derived(getReadings({ limit: 50 }));

	// Handle URL params
	$effect(() => {
		const contractIdParam = new URLSearchParams(page.url.search).get('contractId');
		const customerIdParam = new URLSearchParams(page.url.search).get('customerId');

		if (contractIdParam) {
			selectedContractId = contractIdParam;
			open = true;
		} else if (customerIdParam) {
			// Wait for contracts to load then find match
			contractsPromise.then(({ contracts }) => {
				const match = contracts.find((c) => c.customerId === customerIdParam);
				if (match) {
					selectedContractId = match.id;
					open = true;
				} else {
					toast.error('No active contract found for this customer');
				}
			});
		}
	});

	// Helper to calculate cost preview
	function calculateCost(contractId: string, units: number, contracts: any[]) {
		if (!contractId) return 0;
		const contract = contracts.find((c) => c.id === contractId);
		if (!contract || !contract.property) return 0;
		return units * (contract.property.electricityUnitCost || 0);
	}

	function closeAndFocusTrigger(triggerId: string) {
		comboboxOpen = false;
		tick().then(() => {
			document.getElementById(triggerId)?.focus();
		});
	}
</script>

<div class="flex items-center justify-between space-y-2 p-6">
	<h2 class="text-3xl font-bold tracking-tight">Electricity</h2>
	<div class="flex items-center space-x-2">
		<Button onclick={() => (open = true)}>
			<Plus class="mr-2 h-4 w-4" /> Record Reading
		</Button>
	</div>
</div>

<div class="p-6 pt-0">
	<svelte:boundary>
		{#await readingsPromise}
			<div class="text-center p-8">Loading readings...</div>
		{:then { readings }}
			<Card.Root>
				<Card.Content class="p-0">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Date Recorded</Table.Head>
								<Table.Head>Period</Table.Head>
								<Table.Head>Customer</Table.Head>
								<Table.Head>Room</Table.Head>
								<Table.Head>Units</Table.Head>
								<Table.Head>Cost/Unit</Table.Head>
								<Table.Head>Total</Table.Head>
								<Table.Head>Payment</Table.Head>
								<Table.Head>Note</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each readings as reading}
								<Table.Row>
									<Table.Cell>
										{new Date(reading.readingDate).toLocaleDateString()}
									</Table.Cell>
									<Table.Cell>{reading.month}/{reading.year}</Table.Cell>
									<Table.Cell>{(reading as any).customer?.name}</Table.Cell>
									<Table.Cell>{(reading as any).room?.number}</Table.Cell>
									<Table.Cell>{reading.unitsConsumed}</Table.Cell>
									<Table.Cell>${reading.unitCost}</Table.Cell>
									<Table.Cell class="font-bold">${reading.totalAmount}</Table.Cell>
									<Table.Cell>
										{#if (reading as any).payment}
											<Badge
												variant={(reading as any).payment.status === 'paid'
													? 'default'
													: (reading as any).payment.status === 'pending'
														? 'secondary'
														: 'destructive'}
											>
												{(reading as any).payment.status}
											</Badge>
										{:else}
											<span class="text-muted-foreground">-</span>
										{/if}
									</Table.Cell>
									<Table.Cell class="max-w-[200px] truncate" title={reading.note || ''}>
										{reading.note || '-'}
									</Table.Cell>
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell colspan={9} class="h-24 text-center">
										No readings recorded.
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		{/await}
		{#snippet failed(error: any, reset)}
			<div class="text-destructive">Failed to load readings: {error.message}</div>
			<Button onclick={reset}>Retry</Button>
		{/snippet}
	</svelte:boundary>
</div>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>Record Electricity Reading</Dialog.Title>
			<Dialog.Description>
				Record monthly consumption. This will generate a payment and notify the customer.
			</Dialog.Description>
		</Dialog.Header>

		<form
			class="grid gap-4 py-4"
			{...recordReading.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Reading recorded & Bill generated');
					open = false;
					selectedContractId = '';
					unitsConsumed = 0;
					note = '';
				} catch (e: any) {
					toast.error(e.message);
				}
			})}
		>
			<div class="grid gap-2">
				<Label>Contract / Return</Label>
				<input type="hidden" name="contractId" value={selectedContractId} required />
				{#await contractsPromise}
					<div class="text-xs">Loading contracts...</div>
				{:then { contracts }}
					<Popover.Root bind:open={comboboxOpen}>
						<Popover.Trigger>
							{#snippet child({ props })}
								<Button
									variant="outline"
									role="combobox"
									aria-expanded={comboboxOpen}
									class="w-full justify-between"
									{...props}
								>
									{#if selectedContractId}
										{@const c = contracts.find((c) => c.id === selectedContractId)}
										{c?.customer?.name} - {c?.room?.number}
									{:else}
										Select customer...
									{/if}
									<ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
								</Button>
							{/snippet}
						</Popover.Trigger>
						<Popover.Content class="w-[400px] p-0">
							<Command.Root>
								<Command.Input placeholder="Search customer..." />
								<Command.List>
									<Command.Empty>No items found.</Command.Empty>
									<Command.Group>
										{#each contracts as contract}
											<Command.Item
												value={`${contract.customer?.name} - Room ${contract.room?.number}`}
												onSelect={() => {
													selectedContractId = contract.id;
													closeAndFocusTrigger('trigger');
												}}
											>
												<Check
													class={cn(
														'mr-2 h-4 w-4',
														selectedContractId === contract.id ? 'opacity-100' : 'opacity-0'
													)}
												/>
												{contract.customer?.name} - Room {contract.room?.number} ({contract.property
													?.name})
											</Command.Item>
										{/each}
									</Command.Group>
								</Command.List>
							</Command.Root>
						</Popover.Content>
					</Popover.Root>

					{#if selectedContractId}
						{@const c = contracts.find((x) => x.id === selectedContractId)}
						{#if c?.property?.electricityUnitCost}
							<p class="text-xs text-muted-foreground">
								Unit Cost: ${c.property.electricityUnitCost}
							</p>
						{:else}
							<p class="text-xs text-amber-600">Warning: Property has no unit cost set ($0)</p>
						{/if}
					{/if}
				{/await}
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="grid gap-2">
					<Label for="month">Month</Label>
					<Input
						type="number"
						id="month"
						name="month"
						min="1"
						max="12"
						bind:value={month}
						required
					/>
				</div>
				<div class="grid gap-2">
					<Label for="year">Year</Label>
					<Input type="number" id="year" name="year" min="2020" bind:value={year} required />
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="unitsConsumed">Units Consumed</Label>
				<Input
					type="number"
					id="unitsConsumed"
					name="unitsConsumed"
					step="0.01"
					min="0"
					bind:value={unitsConsumed}
					required
				/>
			</div>

			<div class="grid gap-2">
				<Label for="note">Note (Optional)</Label>
				<Textarea
					id="note"
					name="note"
					bind:value={note}
					placeholder="Add any details about this reading..."
				/>
			</div>

			{#if selectedContractId && unitsConsumed > 0}
				{#await contractsPromise then { contracts }}
					<div class="bg-muted p-2 rounded text-center">
						<span class="text-sm font-semibold">Estimated Bill: </span>
						<span class="text-lg font-bold text-green-600"
							>${calculateCost(selectedContractId, unitsConsumed, contracts).toFixed(2)}</span
						>
					</div>
				{/await}
			{/if}

			<Dialog.Footer>
				<Button type="submit" disabled={!!recordReading.pending}>
					{recordReading.pending ? 'Recording...' : 'Record & Bill'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
