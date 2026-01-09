<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Alert from '$lib/components/ui/alert';
	import { toast } from 'svelte-sonner';
	import { getActiveContracts, submitPayment } from '../payments.remote';
	import { AlertCircle, Info } from '@lucide/svelte';

	let { open = $bindable(false) }: { open: boolean } = $props();

	let contractsPromise = $derived(getActiveContracts());

	let formData = $state({
		contractId: '',
		amount: '',
		type: 'rent' as 'rent' | 'electricity' | 'other',
		mode: 'online' as 'cash' | 'online' | 'upi',
		transactionId: '',
		paymentMethod: '',
		note: ''
	});

	const errors = $derived(
		submitPayment.fields.allIssues()?.reduce((acc: Record<string, string>, issue: any) => {
			const path = issue.path.join('.');
			acc[path] = issue.message;
			return acc;
		}, {}) ?? {}
	);

	function resetForm() {
		formData = {
			contractId: '',
			amount: '',
			type: 'rent',
			mode: 'online',
			transactionId: '',
			paymentMethod: '',
			note: ''
		};
	}

	// Watch payment mode changes to show/hide transaction ID field
	$effect(() => {
		if (formData.mode === 'cash') {
			formData.transactionId = '';
		}
	});
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="max-w-md max-h-[90vh] overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>Submit Payment</Dialog.Title>
			<Dialog.Description>
				Submit your rent or electricity payment. Cash payments are recorded immediately, while
				online/UPI payments require admin verification.
			</Dialog.Description>
		</Dialog.Header>

		<form
			class="space-y-4"
			{...submitPayment.enhance(async ({ submit }) => {
				try {
					await submit();
					toast.success('Payment submitted successfully');
					open = false;
					resetForm();
				} catch (e: any) {
					toast.error(e.message || 'Failed to submit payment');
				}
			})}
		>
			<!-- Hidden inputs for state values -->
			<input type="hidden" name="contractId" value={formData.contractId} />
			<input type="hidden" name="amount" value={formData.amount} />
			<input type="hidden" name="type" value={formData.type} />
			<input type="hidden" name="mode" value={formData.mode} />
			<input type="hidden" name="transactionId" value={formData.transactionId} />
			<input type="hidden" name="paymentMethod" value={formData.paymentMethod} />

			<!-- Contract Selection -->
			{#await contractsPromise}
				<div class="space-y-2">
					<Label>Contract</Label>
					<Select.Root type="single" disabled>
						<Select.Trigger>
							<span class="text-muted-foreground">Loading contracts...</span>
						</Select.Trigger>
					</Select.Root>
				</div>
			{:then { contracts }}
				<div class="space-y-2">
					<Label for="contract">Contract *</Label>
					<Select.Root
						type="single"
						value={formData.contractId}
						onValueChange={(value) => (formData.contractId = value || '')}
					>
						<Select.Trigger class={errors.contractId ? 'border-destructive' : ''}>
							{#if formData.contractId}
								{contracts.find((c) => c.id === formData.contractId)?.property?.name ||
									'Select contract'}
							{:else}
								<span class="text-muted-foreground">Select contract</span>
							{/if}
						</Select.Trigger>
						<Select.Content>
							{#each contracts as contract}
								<Select.Item value={contract.id}>
									{contract.property?.name} - Room {contract.room?.number}
								</Select.Item>
							{:else}
								<div class="p-2 text-sm text-muted-foreground">No active contracts found</div>
							{/each}
						</Select.Content>
					</Select.Root>
					{#if errors.contractId}
						<p class="text-sm text-destructive">{errors.contractId}</p>
					{/if}
				</div>
			{/await}

			<!-- Payment Type -->
			<div class="space-y-2">
				<Label for="type">Payment Type *</Label>
				<Select.Root
					type="single"
					value={formData.type}
					onValueChange={(value) => (formData.type = value as typeof formData.type)}
				>
					<Select.Trigger>
						<span class="capitalize">{formData.type}</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="rent">Rent</Select.Item>
						<Select.Item value="electricity">Electricity</Select.Item>
						<Select.Item value="other">Other</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Amount -->
			<div class="space-y-2">
				<Label for="amount">Amount *</Label>
				<Input
					id="amount"
					type="number"
					step="0.01"
					min="0.01"
					placeholder="Enter amount"
					bind:value={formData.amount}
					class={errors.amount ? 'border-destructive' : ''}
				/>
				{#if errors.amount}
					<p class="text-sm text-destructive">{errors.amount}</p>
				{/if}
			</div>

			<!-- Payment Mode -->
			<div class="space-y-2">
				<Label for="mode">Payment Mode *</Label>
				<Select.Root
					type="single"
					value={formData.mode}
					onValueChange={(value) => (formData.mode = value as typeof formData.mode)}
				>
					<Select.Trigger>
						<span class="uppercase">{formData.mode}</span>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="cash">Cash</Select.Item>
						<Select.Item value="upi">UPI</Select.Item>
						<Select.Item value="online">Online</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<!-- Transaction ID (only for online/UPI) -->
			{#if formData.mode !== 'cash'}
				<div class="space-y-2">
					<Label for="transactionId">Transaction ID *</Label>
					<Input
						id="transactionId"
						type="text"
						placeholder="Enter transaction ID"
						bind:value={formData.transactionId}
						class={errors.transactionId ? 'border-destructive' : ''}
					/>
					{#if errors.transactionId}
						<p class="text-sm text-destructive">{errors.transactionId}</p>
					{/if}
					<p class="text-xs text-muted-foreground">
						Required for verification. Please provide the transaction ID from your payment app.
					</p>
				</div>

				<!-- Payment Method (optional) -->
				<div class="space-y-2">
					<Label for="paymentMethod">Payment Method (Optional)</Label>
					<Input
						id="paymentMethod"
						type="text"
						placeholder="e.g., Google Pay, PhonePe, Paytm"
						bind:value={formData.paymentMethod}
					/>
				</div>
			{/if}

			<!-- Note -->
			<div class="space-y-2">
				<Label for="note">Note (Optional)</Label>
				<Textarea
					id="note"
					placeholder="Add any additional notes..."
					bind:value={formData.note}
					rows={2}
				/>
			</div>

			<!-- Info Alert -->
			<Alert.Root>
				<Info class="h-4 w-4" />
				<Alert.Title>Payment Verification</Alert.Title>
				<Alert.Description>
					{#if formData.mode === 'cash'}
						Cash payments are recorded immediately and will appear in your payment history.
					{:else}
						Online/UPI payments require admin verification. You'll be notified once your payment is
						verified.
					{/if}
				</Alert.Description>
			</Alert.Root>

			<!-- Actions -->
			<div class="flex justify-end gap-2 pt-4">
				<Button
					type="button"
					variant="outline"
					onclick={() => {
						open = false;
						resetForm();
					}}
					disabled={!!submitPayment.pending}
				>
					Cancel
				</Button>
				<Button type="submit" disabled={!!submitPayment.pending}>
					{submitPayment.pending ? 'Submitting...' : 'Submit Payment'}
				</Button>
			</div>
		</form>
	</Dialog.Content>
</Dialog.Root>
