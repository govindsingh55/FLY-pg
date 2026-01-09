<script lang="ts">
	import { page } from '$app/state';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import * as Dialog from '$lib/components/ui/dialog';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Table from '$lib/components/ui/table';
	import { Bell, Check, Plus, Search, User } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { getCustomers } from '../customers/customers.remote';
	import { getNotifications, sendNotification } from './notifications.remote';

	let open = $state(false);
	let selectedRecipients = $state<string[]>([]);
	let message = $state('');
	let title = $state('');
	let type = $state('info');

	// Filtering for recipients
	let recipientSearch = $state('');

	let notificationsPromise = $derived(getNotifications({ filter: 'sent' }));
	let customersPromise = $derived(getCustomers({ pageSize: 100 }));

	function toggleRecipient(id: string) {
		if (selectedRecipients.includes(id)) {
			selectedRecipients = selectedRecipients.filter((r) => r !== id);
		} else {
			selectedRecipients = [...selectedRecipients, id];
		}
	}
</script>

<div class="flex items-center justify-between space-y-2 p-6">
	<h2 class="text-3xl font-bold tracking-tight">Notifications</h2>
	<div class="flex items-center space-x-2">
		<Button onclick={() => (open = true)}>
			<Plus class="mr-2 h-4 w-4" /> Compose
		</Button>
	</div>
</div>

<div class="p-6 pt-0">
	<svelte:boundary>
		{#await notificationsPromise}
			<div class="text-center p-8">Loading notifications...</div>
		{:then { notifications }}
			<Card.Root>
				<Card.Content class="p-0">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Date</Table.Head>
								<Table.Head>Recipient</Table.Head>
								<Table.Head>Type</Table.Head>
								<Table.Head>Title</Table.Head>
								<Table.Head>Message</Table.Head>
								<Table.Head>Status</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each notifications as notification}
								<Table.Row>
									<Table.Cell>
										{notification.createdAt
											? new Date(notification.createdAt).toLocaleDateString() +
												' ' +
												new Date(notification.createdAt).toLocaleTimeString()
											: '-'}
									</Table.Cell>
									<Table.Cell>{(notification as any).user?.name || 'Unknown'}</Table.Cell>
									<Table.Cell>
										<Badge variant="outline" class="capitalize">{notification.type}</Badge>
									</Table.Cell>
									<Table.Cell>{notification.title || '-'}</Table.Cell>
									<Table.Cell class="max-w-md truncate" title={notification.message}>
										{notification.message}
									</Table.Cell>
									<Table.Cell>
										{#if notification.isRead}
											<Badge variant="default" class="bg-green-600">Read</Badge>
										{:else}
											<Badge variant="secondary">Unread</Badge>
										{/if}
									</Table.Cell>
								</Table.Row>
							{:else}
								<Table.Row>
									<Table.Cell colspan={6} class="h-24 text-center">
										No sent notifications found.
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		{/await}
		{#snippet failed(error: any, reset)}
			<div class="text-destructive">Failed to load notifications: {error.message}</div>
			<Button onclick={reset}>Retry</Button>
		{/snippet}
	</svelte:boundary>
</div>

<Dialog.Root bind:open>
	<Dialog.Content class="sm:max-w-[600px]">
		<Dialog.Header>
			<Dialog.Title>Compose Notification</Dialog.Title>
			<Dialog.Description>Send a notification to one or multiple customers.</Dialog.Description>
		</Dialog.Header>

		<form
			class="grid gap-4 py-4"
			{...sendNotification.enhance(async ({ submit }) => {
				// Manually inject selectedRecipients into the form data?
				// Or use hidden inputs. Using form action enhance is cleaner if inputs exist.
				// But selectedRecipients is an array.
				// We'll insert hidden inputs for them.
				try {
					if (selectedRecipients.length === 0) {
						toast.error('Select at least one recipient');
						return;
					}
					await submit();
					toast.success('Notification sent successfully');
					open = false;
					selectedRecipients = [];
					message = '';
					title = '';
				} catch (e: any) {
					toast.error(e.message);
				}
			})}
		>
			{#each selectedRecipients as id}
				<input type="hidden" name="recipientIds" value={id} />
			{/each}

			<div class="grid gap-2">
				<Label>Recipients ({selectedRecipients.length})</Label>
				<div class="border rounded-md p-2 h-48 overflow-y-auto space-y-2">
					<Input placeholder="Search customers..." bind:value={recipientSearch} class="mb-2 h-8" />
					{#await customersPromise}
						<div class="text-xs text-muted-foreground">Loading customers...</div>
					{:then { customers }}
						{@const filtered = customers.filter((c) =>
							c.name.toLowerCase().includes(recipientSearch.toLowerCase())
						)}
						{#each filtered as customer}
							<div
								class="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
								onclick={() => toggleRecipient(customer.userId || '')}
								role="button"
								tabindex="0"
								onkeydown={(e) => e.key === 'Enter' && toggleRecipient(customer.userId || '')}
							>
								<div
									class={`w-4 h-4 border rounded flex items-center justify-center ${selectedRecipients.includes(customer.userId || '') ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}
								>
									{#if selectedRecipients.includes(customer.userId || '')}
										<Check class="h-3 w-3" />
									{/if}
								</div>
								<span class="text-sm">{customer.name}</span>
								{#if !customer.userId}
									<span class="text-xs text-destructive ml-auto">No Account</span>
								{/if}
							</div>
						{/each}
					{/await}
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="type">Type</Label>
				<Select.Root type="single" name="type" bind:value={type}>
					<Select.Trigger>
						{type.charAt(0).toUpperCase() + type.slice(1)}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="info">Info</Select.Item>
						<Select.Item value="warning">Warning</Select.Item>
						<Select.Item value="success">Success</Select.Item>
						<Select.Item value="rent">Rent</Select.Item>
						<Select.Item value="general">General</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="grid gap-2">
				<Label for="title">Title</Label>
				<Input id="title" name="title" bind:value={title} placeholder="Notification Title" />
			</div>

			<div class="grid gap-2">
				<Label for="message">Message</Label>
				<Textarea
					id="message"
					name="message"
					bind:value={message}
					placeholder="Type your message here..."
					required
				/>
			</div>

			<Dialog.Footer>
				<Button type="submit" disabled={!!sendNotification.pending}>
					{sendNotification.pending ? 'Sending...' : 'Send'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
