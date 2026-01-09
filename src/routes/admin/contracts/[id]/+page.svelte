<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import {
		Card,
		CardContent,
		CardDescription,
		CardFooter,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Skeleton } from '$lib/components/ui/skeleton';
	import { Switch } from '$lib/components/ui/switch';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ArrowLeft } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { getContract, updateContract } from '../contracts.remote';
	import * as Table from '$lib/components/ui/table';

	let id = $derived(page.params.id);
	let contractPromise = $derived(getContract(id as string));

	// Derived financial stats
	let financialStats = $derived.by(() => {
		// Wait for promise to resolve in template, but here we can't easily access resolved data
		// Use a reactive snippet or handle inside the await block locally?
		// Actually, simpler to do calculations in the template or extract a child component.
		// For now, let's keep logic simple in the template or use a derived store if we had the data.
		return {};
	});
</script>

<div class="mx-auto max-w-4xl p-6 space-y-6">
	<!-- back button -->
	<Button variant="outline" onclick={() => goto('/admin/contracts')}>
		<ArrowLeft class="mr-2 h-4 w-4" />
		Back
	</Button>

	<svelte:boundary>
		{#await contractPromise}
			<div class="space-y-6">
				<Card>
					<CardHeader>
						<Skeleton class="h-8 w-48 mb-2" />
						<Skeleton class="h-4 w-64" />
					</CardHeader>
					<CardContent class="space-y-4">
						<Skeleton class="h-10 w-full" />
						<Skeleton class="h-10 w-full" />
					</CardContent>
				</Card>
			</div>
		{:then { contract }}
			<form
				{...updateContract.enhance(async ({ submit }: { submit: () => void }) => {
					try {
						await submit();
						toast.success('Contract updated successfully');
					} catch (e: any) {
						toast.error(e.message || 'Failed to update contract');
					}
				})}
			>
				<div class="grid gap-6">
					<!-- Header Info (Read Only) -->
					<Card>
						<CardHeader>
							<div class="flex justify-between items-start">
								<div>
									<CardTitle>Contract Details</CardTitle>
									<CardDescription>ID: {contract.id}</CardDescription>
								</div>
								<Badge variant={contract.status === 'active' ? 'default' : 'secondary'}>
									{contract.status}
								</Badge>
							</div>
						</CardHeader>
						<CardContent class="grid md:grid-cols-2 gap-6">
							<div class="grid gap-1">
								<span class="text-sm font-medium text-muted-foreground">Customer</span>
								<span class="text-lg font-semibold">{contract.customer?.name}</span>
								<span class="text-sm text-muted-foreground">{contract.customer?.phone}</span>
							</div>
							<div class="grid gap-1">
								<span class="text-sm font-medium text-muted-foreground">Property Unit</span>
								<span class="text-lg font-semibold">{contract.property?.name}</span>
								<span class="text-sm text-muted-foreground"
									>Room: {contract.room?.number} ({contract.room?.type})</span
								>
							</div>
						</CardContent>
					</Card>

					<!-- Financial Overview & Booking Info -->
					<div class="grid md:grid-cols-2 gap-6">
						<Card>
							<CardHeader>
								<CardTitle>Financial Overview</CardTitle>
							</CardHeader>
							<CardContent class="space-y-4">
								{@const payments = contract.payments || []}
								{@const rentPaid = payments
									.filter((p) => p.type === 'rent' && p.status === 'paid')
									.reduce((sum, p) => sum + p.amount, 0)}
								{@const depositPaid = payments
									.filter((p) => p.type === 'security_deposit' && p.status === 'paid')
									.reduce((sum, p) => sum + p.amount, 0)}

								<div class="flex justify-between items-center py-2 border-b">
									<span class="text-muted-foreground">Total Rent Paid</span>
									<span class="font-semibold text-green-600">${rentPaid}</span>
								</div>
								<div class="flex justify-between items-center py-2 border-b">
									<span class="text-muted-foreground">Security Deposit</span>
									<div class="text-right">
										<div class="font-semibold">
											${depositPaid} /
											<span class="text-muted-foreground">${contract.securityDeposit ?? 0}</span>
										</div>
										{#if depositPaid >= (contract.securityDeposit ?? 0)}
											<Badge variant="outline" class="text-green-600 border-green-600 mt-1"
												>Fully Paid</Badge
											>
										{:else}
											<Badge variant="outline" class="text-amber-600 border-amber-600 mt-1"
												>Partially Paid</Badge
											>
										{/if}
									</div>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Booking Details</CardTitle>
							</CardHeader>
							<CardContent class="space-y-4">
								{#if contract.booking}
									<div class="flex justify-between items-center py-2 border-b">
										<span class="text-muted-foreground">Booking Date</span>
										<span>{new Date(contract.booking.createdAt).toLocaleDateString()}</span>
									</div>
									<div class="flex justify-between items-center py-2 border-b">
										<span class="text-muted-foreground">Booking Charge</span>
										<span>${contract.booking.bookingCharge}</span>
									</div>
									<div class="flex justify-between items-center py-2 border-b">
										<span class="text-muted-foreground">Status</span>
										<Badge variant="outline">{contract.booking.status}</Badge>
									</div>
								{:else}
									<div class="text-center py-8 text-muted-foreground">No linked booking found.</div>
								{/if}
							</CardContent>
						</Card>
					</div>

					<!-- Payment History -->
					<Card>
						<CardHeader class="flex flex-row items-center justify-between">
							<CardTitle>Payment History</CardTitle>
							<Button variant="outline" size="sm" href="/admin/payments?contractId={contract.id}">
								View All in Payments
							</Button>
						</CardHeader>
						<CardContent>
							<Table.Root>
								<Table.Header>
									<Table.Row>
										<Table.Head>Date</Table.Head>
										<Table.Head>Type</Table.Head>
										<Table.Head>Amount</Table.Head>
										<Table.Head>Mode</Table.Head>
										<Table.Head>Status</Table.Head>
									</Table.Row>
								</Table.Header>
								<Table.Body>
									{#each contract.payments || [] as payment}
										<Table.Row>
											<Table.Cell>
												{payment.paymentDate
													? new Date(payment.paymentDate).toLocaleDateString()
													: '-'}
											</Table.Cell>
											<Table.Cell class="capitalize">
												{payment.type.replace('_', ' ')}
											</Table.Cell>
											<Table.Cell>${payment.amount}</Table.Cell>
											<Table.Cell class="capitalize">{payment.mode}</Table.Cell>
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
											<Table.Cell colspan={5} class="text-center h-24">
												No payments recorded for this contract.
											</Table.Cell>
										</Table.Row>
									{/each}
								</Table.Body>
							</Table.Root>
						</CardContent>
					</Card>

					<!-- Editable Fields -->
					<Card>
						<CardHeader>
							<CardTitle>Lease Terms</CardTitle>
						</CardHeader>
						<CardContent class="grid gap-6">
							<div class="grid md:grid-cols-2 gap-4">
								<div class="grid gap-2">
									<Label for="contractType">Contract Type</Label>
									<Select.Root type="single" name="contractType" bind:value={contract.contractType}>
										<Select.Trigger class="w-full">
											{contract.contractType
												? contract.contractType.charAt(0).toUpperCase() +
													contract.contractType.slice(1)
												: 'Select type'}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="rent">Rent</Select.Item>
											<Select.Item value="lease">Lease</Select.Item>
											<Select.Item value="other">Other</Select.Item>
										</Select.Content>
									</Select.Root>
									{#if updateContract.fields.contractType.issues()}
										<p class="text-sm text-destructive">
											{updateContract.fields.contractType.issues()?.join(', ')}
										</p>
									{/if}
								</div>

								<div class="grid gap-2">
									<Label for="status">Status</Label>
									<Select.Root type="single" name="status" bind:value={contract.status}>
										<Select.Trigger class="w-full">
											{contract.status
												? contract.status.charAt(0).toUpperCase() + contract.status.slice(1)
												: 'Select status'}
										</Select.Trigger>
										<Select.Content>
											<Select.Item value="active">Active</Select.Item>
											<Select.Item value="expired">Expired</Select.Item>
											<Select.Item value="terminated">Terminated</Select.Item>
										</Select.Content>
									</Select.Root>
									{#if updateContract.fields.status.issues()}
										<p class="text-sm text-destructive">
											{updateContract.fields.status.issues()?.join(', ')}
										</p>
									{/if}
								</div>
							</div>

							<div class="grid md:grid-cols-2 gap-4">
								<div class="grid gap-2">
									<Label for="startDate">Start Date</Label>
									<Input
										type="date"
										id="startDate"
										name="startDate"
										required
										value={new Date(contract.startDate).toISOString().split('T')[0]}
									/>
									{#if updateContract.fields.startDate.issues()}
										<p class="text-sm text-destructive">
											{updateContract.fields.startDate.issues()?.join(', ')}
										</p>
									{/if}
								</div>
								<div class="grid gap-2">
									<Label for="endDate">End Date</Label>
									<Input
										type="date"
										id="endDate"
										name="endDate"
										value={contract.endDate
											? new Date(contract.endDate).toISOString().split('T')[0]
											: ''}
									/>
									{#if updateContract.fields.endDate.issues()}
										<p class="text-sm text-destructive">
											{updateContract.fields.endDate.issues()?.join(', ')}
										</p>
									{/if}
								</div>
							</div>

							<div class="grid md:grid-cols-2 gap-4">
								<div class="grid gap-2">
									<Label for="rentAmount">Rent Amount</Label>
									<Input
										type="number"
										id="rentAmount"
										name="rentAmount"
										required
										min="0"
										value={contract.rentAmount}
									/>
									{#if updateContract.fields.rentAmount.issues()}
										<p class="text-sm text-destructive">
											{updateContract.fields.rentAmount.issues()?.join(', ')}
										</p>
									{/if}
								</div>
								<div class="grid gap-2">
									<Label for="securityDeposit">Security Deposit</Label>
									<Input
										type="number"
										id="securityDeposit"
										name="securityDeposit"
										min="0"
										value={contract.securityDeposit}
									/>
									{#if updateContract.fields.securityDeposit.issues()}
										<p class="text-sm text-destructive">
											{updateContract.fields.securityDeposit.issues()?.join(', ')}
										</p>
									{/if}
								</div>
							</div>

							<div class="flex items-center space-x-2">
								<Switch
									id="includeFood"
									name="includeFood"
									checked={contract.includeFood ?? false}
								/>
								<Label for="includeFood">Include Food Service</Label>
							</div>

							<div class="grid gap-2">
								<Label for="notes">Notes</Label>
								<Textarea
									id="notes"
									name="notes"
									placeholder="Additional notes..."
									value={contract.notes || ''}
								/>
							</div>
						</CardContent>
						<CardFooter class="justify-between border-t p-6">
							<Button
								variant="ghost"
								onclick={() => confirm('Discard changes?') && window.location.reload()}
								>Reset</Button
							>
							<Button type="submit" disabled={!!updateContract.pending}>
								{updateContract.pending ? 'Saving...' : 'Save Changes'}
							</Button>
						</CardFooter>
					</Card>
				</div>
			</form>
		{:catch error}
			<div
				class="p-8 text-center text-destructive border rounded-lg border-destructive/50 bg-destructive/10"
			>
				<h3 class="font-semibold mb-2">Error loading contract</h3>
				<p class="text-sm opacity-70 mb-4">{error.message}</p>
				<Button variant="outline" href="/admin/contracts">Go Back</Button>
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
